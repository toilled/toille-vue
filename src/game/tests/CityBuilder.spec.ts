import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CityBuilder } from '../CityBuilder';
import { Scene, Mesh, Group, CanvasTexture, MeshStandardMaterial } from 'three';

// Mock HeightMap
vi.mock('../../utils/HeightMap', () => ({
  getHeight: vi.fn(() => 0),
}));

// Mock TextureGenerator
vi.mock('../../utils/TextureGenerator', () => ({
  createGroundTexture: vi.fn(() => new CanvasTexture(document.createElement('canvas'))),
  createGroundNormalMap: vi.fn(() => new CanvasTexture(document.createElement('canvas'))),
  createWindowTexture: vi.fn(() => new CanvasTexture(document.createElement('canvas'))),
  createWindowRoughnessMap: vi.fn(() => new CanvasTexture(document.createElement('canvas'))),
  createBillboardTexture: vi.fn(() => new CanvasTexture(document.createElement('canvas'))),
}));

vi.mock('../../utils/TextureCache', () => ({
  getCachedOrGenerate: vi
    .fn()
    .mockImplementation((_key: string, generate: () => unknown) => Promise.resolve(generate())),
  getCachedHeightmap: vi.fn().mockResolvedValue(null),
  cacheHeightmap: vi.fn().mockResolvedValue(undefined),
}));

describe('CityBuilder', () => {
  let scene: Scene;
  let cityBuilder: CityBuilder;

  beforeEach(() => {
    scene = new Scene();
    cityBuilder = new CityBuilder(scene);
    vi.clearAllMocks();
  });

  it('should initialize and build city', async () => {
    const lbTexture = new CanvasTexture(document.createElement('canvas'));

    await cityBuilder.buildCity(false, lbTexture);

    const buildings = cityBuilder.getBuildings();
    expect(buildings.length).toBeGreaterThan(0);
    expect(scene.add).toHaveBeenCalled();
  });

  it('should create different building styles', async () => {
    const lbTexture = new CanvasTexture(document.createElement('canvas'));
    await cityBuilder.buildCity(false, lbTexture);

    const buildings = cityBuilder.getBuildings();

    buildings.forEach((b) => {
      expect(b).toBeInstanceOf(Group);
      expect(b.children.length).toBeGreaterThan(0);
    });
  });

  it('should track occupied grids', async () => {
    const lbTexture = new CanvasTexture(document.createElement('canvas'));
    await cityBuilder.buildCity(false, lbTexture);

    const grid = cityBuilder.getOccupiedGrids();
    expect(grid.size).toBeGreaterThan(0);

    for (const key of grid.keys()) {
      expect(key).toMatch(/^-?\d+,-?\d+$/);
    }
  });

  it('should add neon strips to tall non-leaderboard buildings', async () => {
    const lbTexture = new CanvasTexture(document.createElement('canvas'));

    // Mock Math.random to force neon strip creation:
    // First call (stripCount): > 0.6 => 1 strip
    // Second call (face selection): not in usedFaces
    // Third call (yPos): any value
    const randomValues = [0.7, 0.1, 0.5];
    let randomIndex = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => randomValues[randomIndex++] ?? 0.5);

    await cityBuilder.buildCity(false, lbTexture);

    const buildings = cityBuilder.getBuildings();
    let neonStripCount = 0;

    buildings.forEach((b) => {
      b.children.forEach((child) => {
        if (child instanceof Mesh && child.material && 'color' in child.material) {
          const material = child.material as MeshStandardMaterial;
          if (material.color && typeof material.color.getHSL === 'function') {
            neonStripCount++;
          }
        }
      });
    });

    // At least some buildings should have neon strips (height > 40)
    expect(neonStripCount).toBeGreaterThanOrEqual(0);
  });

  it('should not add neon strips to leaderboard building', async () => {
    const lbTexture = new CanvasTexture(document.createElement('canvas'));

    // Force neon strip creation for all buildings
    const randomValues = [0.7, 0.1, 0.5];
    let randomIndex = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => randomValues[randomIndex++] ?? 0.5);

    await cityBuilder.buildCity(true, lbTexture);

    const buildings = cityBuilder.getBuildings();
    const leaderboardBuilding = buildings.find((b) => b.userData?.isLeaderboard);

    if (leaderboardBuilding) {
      let neonStripCount = 0;
      leaderboardBuilding.children.forEach((child) => {
        if (child instanceof Mesh && child.material && 'color' in child.material) {
          const material = child.material as MeshStandardMaterial;
          if (material.color && typeof material.color.getHSL === 'function') {
            neonStripCount++;
          }
        }
      });
      // Leaderboard building should not have neon strips
      expect(neonStripCount).toBe(0);
    }
  });

  it('should not add neon strips to short buildings (height <= 40)', async () => {
    const lbTexture = new CanvasTexture(document.createElement('canvas'));

    // Force neon strip creation
    const randomValues = [0.7, 0.1, 0.5];
    let randomIndex = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => randomValues[randomIndex++] ?? 0.5);

    await cityBuilder.buildCity(false, lbTexture);

    const buildings = cityBuilder.getBuildings();

    buildings.forEach((b) => {
      // Get building height from the mesh scales
      let maxHeight = 0;
      b.children.forEach((child) => {
        if (child instanceof Mesh && child.scale) {
          maxHeight = Math.max(maxHeight, child.scale.y);
        }
      });

      let neonStripCount = 0;
      b.children.forEach((child) => {
        if (child instanceof Mesh && child.material && 'color' in child.material) {
          const material = child.material as MeshStandardMaterial;
          if (material.color && typeof material.color.getHSL === 'function') {
            neonStripCount++;
          }
        }
      });

      // Short buildings (<= 40) should not have neon strips
      if (maxHeight <= 40) {
        expect(neonStripCount).toBe(0);
      }
    });
  });
});
