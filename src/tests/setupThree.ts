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
    // Explicitly mock geometries to ensure they exist even if importActual fails or is incomplete in test env
    CylinderGeometry: class {
      parameters: any;
      constructor(radiusTop?: number, radiusBottom?: number, height?: number, radialSegments?: number, heightSegments?: number, openEnded?: boolean, thetaStart?: number, thetaLength?: number) {
          this.parameters = { radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength };
      }
    },
    ConeGeometry: class {
      parameters: any;
      constructor(radius?: number, height?: number, radialSegments?: number, heightSegments?: number, openEnded?: boolean, thetaStart?: number, thetaLength?: number) {
         this.parameters = { radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength };
      }
    },
    BoxGeometry: class {
        translate() {}
        getIndex() { return null; } // For EdgesGeometry
        getAttribute() { return { count: 0, itemSize: 3, array: [] }; } // For EdgesGeometry
        clone() { return this; }
        parameters = {};
    },
    PlaneGeometry: class {
        parameters: any;
        constructor(width?: number, height?: number) {
            this.parameters = { width, height };
        }
    },
    BufferGeometry: class {
        attributes = { position: { array: [], needsUpdate: false, count: 0, itemSize: 3, getX: vi.fn(), getY: vi.fn(), getZ: vi.fn(), setXYZ: vi.fn() } };
        setAttribute() {}
        setFromPoints() {}
        getIndex() { return null; }
        getAttribute() { return this.attributes.position; }
        computeBoundingSphere() {}
    },
    EdgesGeometry: class {
        constructor(geometry?: any) {}
        scale = { set: vi.fn() };
    },
    // We need to mock Mesh to avoid internal checks on geometry that our mocks fail
    Mesh: class {
        position = { x: 0, y: 0, z: 0, set: vi.fn(), copy: vi.fn(), lerp: vi.fn(), distanceTo: vi.fn(), distanceToSquared: vi.fn() };
        rotation = { x: 0, y: 0, z: 0, copy: vi.fn() };
        scale = { set: vi.fn() };
        material: any;
        geometry: any;
        userData: any = {};
        visible = true;
        renderOrder = 0;

        constructor(geometry?: any, material?: any) {
            this.geometry = geometry;
            this.material = material;
            // Add basic Group/Object3D methods
            (this as any).add = vi.fn();
            (this as any).remove = vi.fn();
            (this as any).traverse = vi.fn((cb: any) => cb(this));
            (this as any).lookAt = vi.fn();
        }
        add() {}
        remove() {}
        traverse(cb: any) { cb(this); }
        lookAt() {}
    },
    // Also mock other classes that might depend on real three.js logic
    Group: class {
        position = { x: 0, y: 0, z: 0, set: vi.fn(), copy: vi.fn() };
        rotation = { x: 0, y: 0, z: 0, copy: vi.fn() };
        userData: any = {};
        visible = true;
        children: any[] = [];
        add(obj: any) { this.children.push(obj); }
        remove(obj: any) { this.children = this.children.filter(c => c !== obj); }
        traverse(cb: any) {
            cb(this);
            this.children.forEach(c => c.traverse && c.traverse(cb));
        }
    },
    MeshStandardMaterial: class {
      clone() { return this; }
    },
    MeshLambertMaterial: class {
        clone() { return this; }
    },
    MeshBasicMaterial: class {
        clone() { return this; }
    },
    LineBasicMaterial: class {},
    LineSegments: class {
         scale = { set: vi.fn() };
         position = { y: 0 };
    },
    PointsMaterial: class {},
    Points: class {
        geometry = { attributes: { position: { array: [], needsUpdate: false, getX: vi.fn(), getY: vi.fn(), getZ: vi.fn(), setXYZ: vi.fn() } } };
        frustumCulled = true;
    },
    SpotLight: class {
      position = { set: vi.fn(), copy: vi.fn() };
      target = { position: { set: vi.fn() } };
      userData = {};
      castShadow = false;
      add() {}
      remove() {}
      dispose() {}
    },
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
