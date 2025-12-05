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

// Polyfill requestAnimationFrame and cancelAnimationFrame
vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => setTimeout(cb, 16)))
vi.stubGlobal('cancelAnimationFrame', vi.fn((id) => clearTimeout(id)))

// Polyfill ResizeObserver
vi.stubGlobal('ResizeObserver', class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
})

// Polyfill fetch
vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
  ok: true
})))
