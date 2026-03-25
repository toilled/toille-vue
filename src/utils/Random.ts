export class SeededRandom {
  private seed: number;

  constructor(seed: number = 1) {
    this.seed = seed;
  }

  // Linear Congruential Generator
  public next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
}

// Global instance with a fixed seed so all clients generate the same world
export const random = new SeededRandom(12345);

// A mulberry32 hash to generate deterministic pseudo-random numbers based on input parameters
// like position or ID, rather than sequential state.
export function hashRandom(seed: number): number {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
