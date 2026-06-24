import { vi } from 'vitest';

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}));
