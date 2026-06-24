import { describe, it, expect } from 'vitest';
import { isFirefox, getBrowserQuality } from '../BrowserDetect';

describe('BrowserDetect', () => {
  describe('isFirefox', () => {
    it('returns false on server (navigator undefined)', () => {
      expect(isFirefox()).toBe(false);
    });
  });

  describe('getBrowserQuality', () => {
    it('returns non-firefox quality when not in firefox', () => {
      const quality = getBrowserQuality();
      expect(quality.pixelRatioCap).toBeGreaterThanOrEqual(1);
      expect(quality.shadowMapType).toBeGreaterThanOrEqual(1);
      expect(quality.msaaSamples).toBeGreaterThanOrEqual(0);
    });
  });
});
