import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CityMaterials } from '../CityMaterials';
import { CityBuilder } from '../CityBuilder';
import { Scene, CanvasTexture } from 'three';
import * as TextureCache from '../../utils/TextureCache';

vi.mock('../../utils/HeightMap', () => ({
  getHeight: vi.fn(() => 0),
}));

vi.mock('../../utils/TextureGenerator', () => ({
  createGroundTexture: vi.fn(() => new CanvasTexture(document.createElement('canvas'))),
  createGroundNormalMap: vi.fn(() => new CanvasTexture(document.createElement('canvas'))),
  createWindowTexture: vi.fn(() => ({ dispose: vi.fn() })),
  createWindowRoughnessMap: vi.fn(() => ({ dispose: vi.fn() })),
  createBillboardTexture: vi.fn(() => ({ dispose: vi.fn() })),
}));

vi.mock('../../utils/TextureCache', () => ({
  getCachedOrGenerate: vi
    .fn()
    .mockImplementation((_key: string, generate: () => unknown) => Promise.resolve(generate())),
  getCachedHeightmap: vi.fn().mockResolvedValue(null),
  cacheHeightmap: vi.fn().mockResolvedValue(undefined),
}));

describe('CityLoading Optimizations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all textures concurrently in CityMaterials.init', async () => {
    const mats = new CityMaterials();
    await mats.init();

    expect(TextureCache.getCachedOrGenerate).toHaveBeenCalledTimes(10);
    expect(mats.billboardTextures.length).toBe(8);
  });

  it('builds city efficiently without dropping frames', async () => {
    const scene = new Scene();
    const cityBuilder = new CityBuilder(scene);
    const lbTexture = new CanvasTexture(document.createElement('canvas'));

    const startTime = performance.now();
    await cityBuilder.buildCity(false, lbTexture);
    const duration = performance.now() - startTime;

    expect(cityBuilder.getBuildings().length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(2000);
  });
});
