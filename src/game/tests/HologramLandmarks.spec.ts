import { describe, it, expect } from 'vitest';
import { HologramLandmarks } from '../HologramLandmarks';

describe('HologramLandmarks', () => {
  it('initializes 3D hologram landmark group', () => {
    const landmark = new HologramLandmarks();
    expect(landmark.group).toBeDefined();
    expect(landmark.group.name).toBe('HologramLandmarksGroup');
  });

  it('updates animation without errors', () => {
    const landmark = new HologramLandmarks();
    expect(() => landmark.update(0.016, 1.0)).not.toThrow();
  });
});
