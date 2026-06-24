import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createWindowTexture,
  createGroundNormalMap,
  createWindowRoughnessMap,
  createGroundTexture,
  createBillboardTextures,
  createCloudTexture,
} from '../TextureGenerator';
import { CanvasTexture } from 'three';

describe('TextureGenerator', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('createWindowTexture returns a CanvasTexture', () => {
    const tex = createWindowTexture();
    expect(tex).toBeInstanceOf(CanvasTexture);
    expect(tex.wrapS).toBeDefined();
  });

  it('createGroundNormalMap returns a CanvasTexture', () => {
    const tex = createGroundNormalMap();
    expect(tex).toBeInstanceOf(CanvasTexture);
  });

  it('createWindowRoughnessMap returns a CanvasTexture', () => {
    const tex = createWindowRoughnessMap();
    expect(tex).toBeInstanceOf(CanvasTexture);
  });

  it('createGroundTexture returns a CanvasTexture', () => {
    const tex = createGroundTexture();
    expect(tex).toBeInstanceOf(CanvasTexture);
  });

  it('createBillboardTextures returns an array of CanvasTextures', () => {
    const textures = createBillboardTextures();
    expect(textures.length).toBe(8);
    textures.forEach((tex) => {
      expect(tex).toBeInstanceOf(CanvasTexture);
    });
  });

  it('createCloudTexture returns a CanvasTexture', () => {
    const tex = createCloudTexture();
    expect(tex).toBeInstanceOf(CanvasTexture);
  });
});
