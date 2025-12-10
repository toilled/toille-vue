import { vi } from 'vitest'

// @ts-expect-error: Mocking complex overload structure
HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
  if (contextId === '2d') {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => []),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      strokeRect: vi.fn(),
      // Add setters as properties
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      shadowColor: '',
      shadowBlur: 0,
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
});

// Mock Three.js to avoid WebGL context issues in JSDOM
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual as Record<string, unknown>,
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
  observe() { }
  unobserve() { }
  disconnect() { }
})

// Polyfill fetch
vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
  ok: true
})))

// Polyfill AudioContext
vi.stubGlobal('AudioContext', class AudioContext {
  state = 'suspended';
  currentTime = 0;
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        value: 0
      },
      connect: vi.fn(),
    };
  }
  createBuffer(channels: number, length: number, sampleRate: number) {
     return {
         getChannelData: vi.fn(() => new Float32Array(length))
     }
  }
  createBufferSource() {
      return {
          buffer: null,
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn()
      }
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }
  destination = {};
  sampleRate = 44100;
})
vi.stubGlobal('webkitAudioContext', (globalThis as any).AudioContext);
