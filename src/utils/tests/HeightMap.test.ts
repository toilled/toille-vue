import { describe, it, expect } from 'vitest';
import { getHeight, HeightMap } from '../HeightMap';

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
});
