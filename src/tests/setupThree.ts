import { vi } from 'vitest'

// Mock Three.js to avoid WebGL context issues in JSDOM
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual as any,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      domElement: document.createElement('canvas'),
      dispose: vi.fn(),
      shadowMap: { enabled: false, type: 0 },
    })),
  };
});
