import { describe, it, expect } from 'vitest';
import { CityMaterials } from '../CityMaterials';

vi.mock('../../utils/TextureGenerator', () => ({
  createWindowTexture: () => ({ dispose: vi.fn() }),
  createWindowRoughnessMap: () => ({ dispose: vi.fn() }),
  createBillboardTextures: () => [{ dispose: vi.fn() }, { dispose: vi.fn() }],
}));

vi.mock('../../utils/TextureCache', () => ({
  getCachedOrGenerate: vi
    .fn()
    .mockImplementation((_key: string, generate: () => unknown) => Promise.resolve(generate())),
}));

describe('CityMaterials', () => {
  it('initializes all materials and geometries', async () => {
    const mats = new CityMaterials();
    await mats.init();
    expect(mats.buildingMaterial).toBeDefined();
    expect(mats.roofMaterial).toBeDefined();
    expect(mats.edgeMat1).toBeDefined();
    expect(mats.edgeMat2).toBeDefined();
    expect(mats.topEdgeMat).toBeDefined();
    expect(mats.antennaMat).toBeDefined();
    expect(mats.boxGeo).toBeDefined();
    expect(mats.coneGeo).toBeDefined();
    expect(mats.cylinderGeo).toBeDefined();
  });

  it('creates audio materials for all audio keys', async () => {
    const mats = new CityMaterials();
    await mats.init();
    const keys = ['kick', 'snare', 'hihat', 'bass0', 'bass1', 'bass2', 'bass3', 'bass4'];
    keys.forEach((key) => {
      expect(mats.audioMaterials[key]).toBeDefined();
    });
  });

  it('creates billboard textures and materials', async () => {
    const mats = new CityMaterials();
    await mats.init();
    expect(mats.billboardTextures.length).toBeGreaterThan(0);
    expect(mats.billboardMaterials.length).toBe(mats.billboardTextures.length);
  });

  it('reuses geometries', async () => {
    const mats = new CityMaterials();
    await mats.init();
    expect(mats.neonStripGeo).toBeDefined();
    expect(mats.edgesGeo).toBeDefined();
    expect(mats.coneEdgesGeo).toBeDefined();
  });
});
