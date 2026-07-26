import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createWindowTexture,
  createGroundNormalMap,
  createWindowRoughnessMap,
  createGroundTexture,
  createBillboardTextures,
  createCloudTexture,
  createBillboardTexture,
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

  it('createGroundNormalMap returns a CanvasTexture', { timeout: 15000 }, () => {
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

  describe('createBillboardTexture (tests drawBillboardContent)', () => {
    it('creates texture for case 0 (horizontal bars)', () => {
      const tex = createBillboardTexture(0);
      expect(tex).toBeInstanceOf(CanvasTexture);
    });

    it('creates texture for case 1 (circle with inner)', () => {
      const tex = createBillboardTexture(1);
      expect(tex).toBeInstanceOf(CanvasTexture);
    });

    it('creates texture for case 2 (triangle)', () => {
      const tex = createBillboardTexture(2);
      expect(tex).toBeInstanceOf(CanvasTexture);
    });

    it('creates texture for case 3 (grid)', () => {
      const tex = createBillboardTexture(3);
      expect(tex).toBeInstanceOf(CanvasTexture);
    });

    it('creates texture for case 4 (CYBER text)', () => {
      const tex = createBillboardTexture(4);
      expect(tex).toBeInstanceOf(CanvasTexture);
    });

    it('creates texture for default case (random rectangles)', () => {
      const tex = createBillboardTexture(5);
      expect(tex).toBeInstanceOf(CanvasTexture);
    });

    it('creates texture for case 6', () => {
      const tex = createBillboardTexture(6);
      expect(tex).toBeInstanceOf(CanvasTexture);
    });

    it('creates texture for case 7', () => {
      const tex = createBillboardTexture(7);
      expect(tex).toBeInstanceOf(CanvasTexture);
    });

    it('uses the provided accent color', () => {
      const tex = createBillboardTexture(0);
      expect(tex).toBeInstanceOf(CanvasTexture);
    });
  });
});
