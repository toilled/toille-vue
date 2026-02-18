import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CityBuilder } from '../CityBuilder';
import { Scene, Mesh, Group, CanvasTexture, LineSegments, SpotLight, Object3D } from 'three';

// Mock HeightMap
vi.mock('../utils/HeightMap', () => ({
  getHeight: vi.fn(() => 0),
}));

// Mock TextureGenerator
vi.mock('../utils/TextureGenerator', () => ({
  createGroundTexture: vi.fn(() => new CanvasTexture(document.createElement('canvas'))),
  createWindowTexture: vi.fn(() => new CanvasTexture(document.createElement('canvas'))),
  createBillboardTextures: vi.fn(() => [new CanvasTexture(document.createElement('canvas'))]),
  createRoughFloorTexture: vi.fn(() => new CanvasTexture(document.createElement('canvas'))),
}));

describe('CityBuilder', () => {
  let scene: Scene;
  let cityBuilder: CityBuilder;

  beforeEach(() => {
    scene = new Scene();
    cityBuilder = new CityBuilder(scene);

    // Clear mocks
    vi.clearAllMocks();
  });

  it('should initialize and build city', () => {
    const lbTexture = new CanvasTexture(document.createElement('canvas'));

    cityBuilder.buildCity(false, lbTexture);

    // Verify buildings are created
    const buildings = cityBuilder.getBuildings();
    expect(buildings.length).toBeGreaterThan(0);

    // Check if scene.add was called
    expect(scene.add).toHaveBeenCalled();
  });

  it('should create different building styles', () => {
      const lbTexture = new CanvasTexture(document.createElement('canvas'));
      cityBuilder.buildCity(false, lbTexture);

      const buildings = cityBuilder.getBuildings();

      buildings.forEach(b => {
          expect(b).toBeInstanceOf(Group);
          expect(b.children.length).toBeGreaterThan(0);
          b.children.forEach(child => {
              const valid =
                child instanceof Mesh ||
                child instanceof LineSegments ||
                child instanceof SpotLight ||
                child instanceof Object3D; // For spot.target
              expect(valid).toBe(true);
          });
      });
  });

  it('should track occupied grids', () => {
      const lbTexture = new CanvasTexture(document.createElement('canvas'));
      cityBuilder.buildCity(false, lbTexture);

      const grid = cityBuilder.getOccupiedGrids();
      expect(grid.size).toBeGreaterThan(0);

      // Check if grid keys are in "x,z" format
      for (const key of grid.keys()) {
          expect(key).toMatch(/^-?\d+,-?\d+$/);
      }
  });
});
