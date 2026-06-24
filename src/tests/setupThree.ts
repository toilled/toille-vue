import { vi } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */

// @ts-expect-error: Mocking complex overload structure
HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string, _options?: any) => {
  if (
    contextId === '2d' ||
    contextId === 'webgl' ||
    contextId === 'webgl2' ||
    contextId === 'experimental-webgl'
  ) {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn((_x: number, _y: number, w: number, h: number) => {
        const length = (w || 1024) * (h || 1024) * 4;
        return { data: new Uint8ClampedArray(length) };
      }),
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
      setLineDash: vi.fn(),
      fillText: vi.fn(), // Added fillText
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      shadowColor: '',
      shadowBlur: 0,
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
});

class MockColor {
  r = 0;
  g = 0;
  b = 0;
  constructor(_color?: number | string) {}
  setHex(_hex: number) {
    return this;
  }
  setHSL() {
    return this;
  }
  clone() {
    const c = new MockColor();
    c.r = this.r;
    c.g = this.g;
    c.b = this.b;
    return c;
  }
  copy(c: any) {
    if (c) {
      this.r = c.r;
      this.g = c.g;
      this.b = c.b;
    }
    return this;
  }
  getHex() {
    return 0;
  }
  toArray(arr: any[] = [], offset = 0) {
    arr[offset] = this.r;
    arr[offset + 1] = this.g;
    arr[offset + 2] = this.b;
    return arr;
  }
}

vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...(actual as Record<string, unknown>),
    Color: MockColor,
    WebGLRenderer: class {
      domElement = document.createElement('canvas');
      shadowMap = { enabled: false, type: 0 };
      toneMapping = 0;
      toneMappingExposure = 1;
      setSize = vi.fn();
      getSize = vi.fn().mockImplementation((target: any) => {
        target.width = 1024;
        target.height = 768;
        return target;
      });
      setPixelRatio = vi.fn();
      getPixelRatio = vi.fn(() => 1);
      render = vi.fn();
      dispose = vi.fn();
      setAnimationLoop = vi.fn();
      constructor(_parameters?: any) {}
    },
    CylinderGeometry: class {
      groups: any[] = [];
      morphAttributes: Record<string, any> = {};
      attributes: any = { position: { count: 0, itemSize: 3, array: new Float32Array() } };
      index: any = null;
      parameters: any;
      constructor() {}
      translate() {}
      rotateX = vi.fn();
      rotateZ = vi.fn();
      getIndex() {
        return this.index;
      }
      getAttribute(name: string) {
        return this.attributes[name];
      }
      setIndex() {
        return this;
      }
      clone() {
        return new (this.constructor as any)();
      }
      applyMatrix4() {
        return this;
      }
      computeVertexNormals() {}
      dispose() {}
    },
    SphereGeometry: class {
      groups: any[] = [];
      morphAttributes: Record<string, any> = {};
      attributes: any = { position: { count: 0, itemSize: 3, array: new Float32Array() } };
      index: any = null;
      parameters: any;
      constructor() {}
      translate() {}
      getIndex() {
        return this.index;
      }
      getAttribute(name: string) {
        return this.attributes[name];
      }
      setIndex() {
        return this;
      }
      clone() {
        return new (this.constructor as any)();
      }
      applyMatrix4() {
        return this;
      }
      computeVertexNormals() {}
      dispose() {}
    },
    ConeGeometry: class {
      groups: any[] = [];
      morphAttributes: Record<string, any> = {};
      attributes: any = { position: { count: 0, itemSize: 3, array: new Float32Array() } };
      index: any = null;
      parameters: any;
      constructor() {}
      translate() {}
      getIndex() {
        return this.index;
      }
      getAttribute(name: string) {
        return this.attributes[name];
      }
      setIndex() {
        return this;
      }
      clone() {
        return new (this.constructor as any)();
      }
      applyMatrix4() {
        return this;
      }
      computeVertexNormals() {}
      dispose() {}
    },
    BoxGeometry: class {
      groups: any[] = [];
      morphAttributes: Record<string, any> = {};
      attributes: any = {
        position: { count: 24, itemSize: 3, array: new Float32Array(72) },
        normal: { count: 24, itemSize: 3, array: new Float32Array(72) },
        uv: { count: 24, itemSize: 2, array: new Float32Array(48) },
      };
      index: any = { array: new Uint16Array(36) };
      translate() {}
      getIndex() {
        return this.index;
      }
      getAttribute(name: string) {
        return this.attributes[name];
      }
      setIndex(_arr: any) {
        return this;
      }
      applyMatrix4(_m: any) {
        return this;
      }
      clone() {
        const c = new (this.constructor as any)();
        c.groups = this.groups.map((g: any) => ({ ...g }));
        c.morphAttributes = this.morphAttributes;
        return c;
      }
      computeVertexNormals() {}
      dispose() {}
      parameters = {};
    },
    PlaneGeometry: class {
      parameters: any;
      attributes: any;
      constructor(width?: number, height?: number) {
        this.parameters = { width, height };
        this.attributes = {
          position: {
            count: 100, // Dummy count
            getX: vi.fn(() => 0),
            getY: vi.fn(() => 0),
            getZ: vi.fn(() => 0),
            setZ: vi.fn(),
          },
        };
      }
      computeVertexNormals = vi.fn();
      dispose() {}
    },
    BufferGeometry: class {
      groups: any[] = [];
      morphAttributes: Record<string, any> = {};
      attributes: Record<string, any> = {
        position: {
          array: new Float32Array(),
          needsUpdate: false,
          count: 0,
          itemSize: 3,
          getX: vi.fn(),
          getY: vi.fn(),
          getZ: vi.fn(),
          setXYZ: vi.fn(),
        },
      };
      index: any = null;
      setIndex(arr: any) {
        this.index = arr;
        return this;
      }
      setAttribute(name: string, attr: any) {
        this.attributes[name] = attr;
        return this;
      }
      setFromPoints() {}
      getIndex() {
        return this.index;
      }
      getAttribute(name: string) {
        return this.attributes[name];
      }
      hasAttribute(name: string) {
        return name in this.attributes;
      }
      applyMatrix4(_m: any) {
        return this;
      }
      clone() {
        const c = new (this.constructor as any)();
        c.attributes = this.attributes;
        c.index = this.index;
        c.groups = this.groups.map((g: any) => ({ ...g }));
        c.morphAttributes = this.morphAttributes;
        return c;
      }
      computeBoundingSphere() {}
      computeVertexNormals() {}
      dispose() {}
    },
    EdgesGeometry: class {
      constructor() {}
      scale = { set: vi.fn() };
      dispose() {}
    },
    Mesh: class {
      position = {
        x: 0,
        y: 0,
        z: 0,
        set: vi.fn(function (
          this: { x: number; y: number; z: number },
          x: number,
          y: number,
          z: number
        ) {
          this.x = x;
          this.y = y;
          this.z = z;
          return this;
        }),
        copy: vi.fn(function (
          this: { x: number; y: number; z: number },
          v: { x: number; y: number; z: number }
        ) {
          this.x = v.x;
          this.y = v.y;
          this.z = v.z;
          return this;
        }),
        lerp: vi.fn(),
        distanceTo: vi.fn(),
        distanceToSquared: vi.fn(),
      };
      up = { x: 0, y: 1, z: 0, set: vi.fn(), copy: vi.fn() };
      rotation = { x: 0, y: 0, z: 0, copy: vi.fn() };
      scale = { set: vi.fn() };
      material: any;
      geometry: any;
      userData: any = {};
      visible = true;
      renderOrder = 0;
      isObject3D = true;
      layers = { mask: 1, test: vi.fn(() => true) };
      raycast = vi.fn();
      matrixWorld = {
        elements: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        copy: vi.fn(),
        clone: vi.fn(),
        multiply: vi.fn(),
        decompose: vi.fn(),
        compose: vi.fn(),
        identity: vi.fn(),
        invert: vi.fn(),
      };
      updateWorldMatrix = vi.fn();

      constructor(geometry?: any, material?: any) {
        this.geometry = geometry;
        this.material = material;
        (this as any).add = vi.fn();
        (this as any).remove = vi.fn();
        (this as any).removeFromParent = vi.fn();
        (this as any).traverse = vi.fn((cb: any) => cb(this));
        (this as any).lookAt = vi.fn();
        (this as any).dispatchEvent = vi.fn();
        (this as any).addEventListener = vi.fn();
        (this as any).removeEventListener = vi.fn();
      }
      add() {}
      remove() {}
      removeFromParent() {}
      traverse(cb: any) {
        cb(this);
      }
      lookAt() {}
      dispatchEvent() {}
      addEventListener() {}
      removeEventListener() {}
    },
    Group: class {
      matrixWorld = {
        elements: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        copy: vi.fn(),
        clone: vi.fn(),
        multiply: vi.fn(),
        decompose: vi.fn(),
        compose: vi.fn(),
        identity: vi.fn(),
        invert: vi.fn(),
      };
      position = {
        x: 0,
        y: 0,
        z: 0,
        set: vi.fn(function (
          this: { x: number; y: number; z: number },
          x: number,
          y: number,
          z: number
        ) {
          this.x = x;
          this.y = y;
          this.z = z;
          return this;
        }),
        copy: vi.fn(function (
          this: { x: number; y: number; z: number },
          v: { x: number; y: number; z: number }
        ) {
          this.x = v.x;
          this.y = v.y;
          this.z = v.z;
          return this;
        }),
        distanceTo: vi.fn(),
        distanceToSquared: vi.fn(),
      };
      up = { x: 0, y: 1, z: 0, set: vi.fn(), copy: vi.fn() };
      rotation = { x: 0, y: 0, z: 0, copy: vi.fn() };
      userData: any = {};
      visible = true;
      isObject3D = true;
      children: any[] = [];
      layers = { mask: 1, test: vi.fn(() => true) };
      raycast = vi.fn();
      add(obj: any) {
        this.children.push(obj);
        if (obj && !obj.lookAt) obj.lookAt = vi.fn();
      }
      remove(obj: any) {
        this.children = this.children.filter((c) => c !== obj);
      }
      removeFromParent() {}
      updateWorldMatrix = vi.fn();
      traverse(cb: any) {
        cb(this);
        this.children.forEach((c) => c.traverse && c.traverse(cb));
      }
      lookAt = vi.fn();
      dispatchEvent() {}
      addEventListener() {}
      removeEventListener() {}
    },
    Scene: class {
      add = vi.fn();
      remove = vi.fn();
      children = [];
      background = null;
      fog = null;
      isObject3D = true;
    },
    MeshStandardMaterial: class {
      color = new MockColor();
      map = null;
      emissiveMap = null;
      roughnessMap = null;
      emissive = new MockColor();
      emissiveIntensity = 0.8;
      roughness = 0.5;
      metalness = 0.8;
      transparent = false;
      opacity = 1;
      clone() {
        const c = new (this.constructor as any)();
        c.color = this.color.clone();
        c.opacity = this.opacity;
        c.transparent = this.transparent;
        return c;
      }
      dispose() {}
    },
    MeshLambertMaterial: class {
      clone() {
        return this;
      }
      dispose() {}
    },
    MeshBasicMaterial: class {
      color = new MockColor();
      map = null;
      transparent = false;
      opacity = 1;
      constructor(params?: any) {
        if (params?.color !== undefined) this.color = new MockColor();
      }
      clone() {
        const c = new (this.constructor as any)();
        c.color = this.color.clone();
        c.opacity = this.opacity;
        c.transparent = this.transparent;
        return c;
      }
      dispose() {}
    },
    LineBasicMaterial: class {
      dispose() {}
    },
    LineSegments: class {
      scale = { set: vi.fn() };
      position = {
        x: 0,
        y: 0,
        z: 0,
        set: vi.fn(),
        copy: vi.fn(),
      };
      rotation = { x: 0, y: 0, z: 0, copy: vi.fn() };
      isObject3D = true;
      add() {}
      removeFromParent() {}
      dispatchEvent() {}
      addEventListener() {}
      removeEventListener() {}
    },
    PointsMaterial: class {
      dispose() {}
    },
    Points: class {
      geometry = {
        attributes: {
          position: {
            array: [],
            needsUpdate: false,
            getX: vi.fn(),
            getY: vi.fn(),
            getZ: vi.fn(),
            setXYZ: vi.fn(),
          },
          color: {
            // Added color attribute support
            array: [],
            needsUpdate: false,
            setXYZ: vi.fn(),
          },
        },
        dispose: vi.fn(), // Added dispose to geometry
      };
      material = {
        dispose: vi.fn(), // Added dispose to material
      };
      frustumCulled = true;
      isObject3D = true;
      add() {}
      removeFromParent() {}
      dispatchEvent() {}
      addEventListener() {}
      removeEventListener() {}
    },
    Raycaster: class {
      params = { Points: { threshold: 1 } };
      setFromCamera = vi.fn();
      intersectObject = vi.fn(() => []);
      intersectObjects = vi.fn(() => []);
    },
    SpotLight: class {
      position = { set: vi.fn(), copy: vi.fn() };
      target = { position: { set: vi.fn() } };
      userData = {};
      castShadow = false;
      isObject3D = true;
      add() {}
      remove() {}
      removeFromParent() {}
      dispose() {}
      dispatchEvent() {}
      addEventListener() {}
      removeEventListener() {}
    },
    PointLight: class {
      position = { set: vi.fn(), copy: vi.fn() };
      color = { getHex: vi.fn(() => 0xff0000) };
      userData = {};
      visible = true;
      isObject3D = true;
      constructor(color?: any, _intensity?: any, _distance?: any) {
        if (color !== undefined) this.color.getHex = vi.fn(() => color);
      }
      traverse(cb: any) {
        cb(this);
      }
      add() {}
      remove() {}
      removeFromParent() {}
      dispose() {}
      dispatchEvent() {}
      addEventListener() {}
      removeEventListener() {}
    },
    HemisphereLight: class {
      position = { set: vi.fn(), copy: vi.fn() };
      isObject3D = true;
      constructor() {}
      add() {}
      remove() {}
      removeFromParent() {}
      dispose() {}
    },
    PCFSoftShadowMap: 2,
    ACESFilmicToneMapping: 4,
  };
});

vi.mock('three/examples/jsm/postprocessing/EffectComposer', () => ({
  EffectComposer: class {
    constructor() {}
    addPass = vi.fn();
    removePass = vi.fn();
    render = vi.fn();
    setSize = vi.fn();
    passes = [
      { strength: 1.5, radius: 0.4, threshold: 0.85 }, // Bloom pass simulation
    ];
  },
}));

vi.mock('three/examples/jsm/postprocessing/RenderPass', () => ({
  RenderPass: class {
    constructor() {}
  },
}));

vi.mock('three/examples/jsm/postprocessing/UnrealBloomPass', () => ({
  UnrealBloomPass: class {
    strength = 1.5;
    radius = 0.4;
    threshold = 0.85;
    constructor() {}
  },
}));

vi.mock('three/examples/jsm/postprocessing/AfterimagePass', () => ({
  AfterimagePass: class {
    enabled = false;
    uniforms = { damp: { value: 0.96 } };
    constructor() {}
  },
}));

vi.mock('three/examples/jsm/postprocessing/GlitchPass', () => ({
  GlitchPass: class {
    enabled = false;
    goWild = false;
    constructor() {}
  },
}));

vi.mock('three/examples/jsm/postprocessing/OutputPass', () => ({
  OutputPass: class {
    constructor() {}
  },
}));

vi.stubGlobal(
  'requestAnimationFrame',
  vi.fn((cb) => setTimeout(cb, 16))
);
vi.stubGlobal(
  'cancelAnimationFrame',
  vi.fn((id) => clearTimeout(id))
);

vi.stubGlobal(
  'ResizeObserver',
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

vi.stubGlobal(
  'fetch',
  vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      ok: true,
      headers: {
        get: vi.fn(),
      },
    })
  )
);

vi.stubGlobal(
  'AudioContext',
  class AudioContext {
    state = 'suspended';
    currentTime = 0;
    createOscillator() {
      return {
        type: 'sine',
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          setTargetAtTime: vi.fn(),
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
          setTargetAtTime: vi.fn(),
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
          setTargetAtTime: vi.fn(),
          value: 0,
        },
        connect: vi.fn(),
      };
    }
    createBuffer() {
      return { getChannelData: vi.fn(() => new Float32Array(0)) };
    }
    createBufferSource() {
      return { buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
    }
    resume() {
      this.state = 'running';
      return Promise.resolve();
    }
    suspend() {
      this.state = 'suspended';
      return Promise.resolve();
    }
    close() {
      // Added close method
      this.state = 'closed';
      return Promise.resolve();
    }
    destination = {};
    sampleRate = 44100;
  }
);
vi.stubGlobal('webkitAudioContext', (globalThis as any).AudioContext);
