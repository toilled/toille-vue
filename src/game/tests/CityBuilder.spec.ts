import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CityBuilder } from '../CityBuilder';
import { Scene } from 'three';
import { CityData } from '../types';

global.fetch = vi.fn();

describe('CityBuilder', () => {
    let scene: Scene;
    let cityBuilder: CityBuilder;

    beforeEach(() => {
        scene = new Scene();
        cityBuilder = new CityBuilder(scene);
        vi.clearAllMocks();
    });

    it('should fetch city data and build city', async () => {
        const mockData: CityData = {
            buildings: [
                {
                    x: 100, z: 100, width: 50, height: 100, depth: 50,
                    isLeaderboard: false,
                    style: 'SIMPLE',
                    tiers: [],
                    greebles: [],
                }
            ],
            floorTiles: [
                { x: 200, z: 200, size: 50 }
            ]
        };

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockData
        });

        // lbTexture mock (can be anything as it's passed to material)
        const lbTexture = {};

        await cityBuilder.buildCity(false, lbTexture);

        expect(global.fetch).toHaveBeenCalledWith('/api/city');

        // Verify buildings are created
        const buildings = cityBuilder.getBuildings();
        expect(buildings.length).toBe(2); // 1 building + 1 floor tile

        // Verify occupied grids
        const occupied = cityBuilder.getOccupiedGrids();
        expect(occupied.size).toBe(1); // Only building occupies grid
    });

    it('should handle fetch failure gracefully', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await cityBuilder.buildCity(false, {});

        expect(global.fetch).toHaveBeenCalledWith('/api/city');
        expect(consoleSpy).toHaveBeenCalled();
    });
});
