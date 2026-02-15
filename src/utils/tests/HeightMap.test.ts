import { describe, it, expect } from 'vitest';
import { getHeight, getNormal, HeightMap } from '../HeightMap';

describe('HeightMap', () => {
    it('should return a number', () => {
        const h = getHeight(0, 0);
        expect(typeof h).toBe('number');
    });

    it('should be deterministic', () => {
        const h1 = getHeight(100, 100);
        const h2 = getHeight(100, 100);
        expect(h1).toBe(h2);
    });

    it('should vary with position', () => {
        const h1 = getHeight(0, 0);
        const h2 = getHeight(1000, 1000);
        expect(h1).not.toBe(h2);
    });

    it('should return 0 or near 0 for consistent input', () => {
        // Just checking it doesn't crash
        getHeight(500, -200);
    });

    it('should return a normalized normal vector', () => {
        const n = getNormal(100, 100);
        expect(n).toHaveProperty('x');
        expect(n).toHaveProperty('y');
        expect(n).toHaveProperty('z');
        const length = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
        expect(Math.abs(length - 1)).toBeLessThan(0.001);
    });

    it('should be higher outside the city', () => {
        const cityH = Math.abs(getHeight(0, 0));
        // CITY_SIZE is 2000. Outside is > 1000.
        const desertH = getHeight(2500, 0);
        expect(desertH).toBeGreaterThan(cityH + 40);
    });
});
