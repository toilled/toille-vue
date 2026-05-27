import { vi } from 'vitest';

// Mock the @vueuse/head module
vi.mock('@vueuse/head', () => ({
  useHead: vi.fn(),
  createHead: vi.fn(() => ({
    headEntries: () => [],
  })),
  headSymbol: Symbol('head'),
}));
