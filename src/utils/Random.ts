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
