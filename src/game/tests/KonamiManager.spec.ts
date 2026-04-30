import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KonamiManager } from '../KonamiManager';

vi.mock('three', () => {
  return {
    Scene: vi.fn(() => ({
      add: vi.fn(),
      remove: vi.fn(),
    })),
    BufferGeometry: vi.fn(() => ({
      setAttribute: vi.fn(),
    })),
    BufferAttribute: vi.fn(),
    Points: vi.fn(() => ({
      frustumCulled: true,
      geometry: {
        attributes: {
          position: {
            array: new Float32Array(4500),
            needsUpdate: false,
          },
          color: {
            array: new Float32Array(4500),
            needsUpdate: false,
            setXYZ: vi.fn(),
          },
        },
        dispose: vi.fn(),
      },
      material: {
        dispose: vi.fn(),
      },
    })),
    PointsMaterial: vi.fn(() => ({
      dispose: vi.fn(),
    })),
    Float32BufferAttribute: vi.fn(),
    AdditiveBlending: 2000,
  };
});

// We need to import three to spy on it, AFTER the mock
import * as THREE from 'three';
import type { Scene } from 'three';

describe('KonamiManager', () => {
  let scene: Scene;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = new THREE.Scene();
    new KonamiManager(scene);
  });

  it('should initialize fireworks positions off-screen', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calls = (THREE.BufferAttribute as any).mock.calls;
    let fireworksPosFound = false;

    for (const call of calls) {
      const array = call[0];
      const itemSize = call[1];

      // fireworkCount is 1500, so array length is 4500
      if (array.length === 4500 && itemSize === 3) {
        // Indices 1, 4, 7 are Y coordinates
        if (array[1] < -9000 && array[4] < -9000) {
          fireworksPosFound = true;
        }
      }
    }
    expect(fireworksPosFound).toBe(true);
  });
});
