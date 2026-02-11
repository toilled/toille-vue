import { vi } from "vitest";

// @ts-expect-error: Mocking complex overload structure
HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
  if (contextId === "2d") {
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
      setLineDash: vi.fn(),
      fillText: vi.fn(), // Added fillText
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      shadowColor: "",
      shadowBlur: 0,
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
});

vi.mock("three", async () => {
  const actual = await vi.importActual("three");
  return {
    ...(actual as Record<string, unknown>),
    WebGLRenderer: class {
      domElement = document.createElement("canvas");
      shadowMap = { enabled: false, type: 0 };
      toneMapping = 0;
      toneMappingExposure = 1;
      setSize = vi.fn();
      setPixelRatio = vi.fn();
      getPixelRatio = vi.fn(() => 1);
      render = vi.fn();
      dispose = vi.fn();
      setAnimationLoop = vi.fn();
      constructor(parameters?: any) { }
    },
    CylinderGeometry: class {
      parameters: any;
      constructor() { }
      translate() { }
      rotateX = vi.fn();
      rotateZ = vi.fn();
      dispose() { }
    },
    SphereGeometry: class {
      parameters: any;
      constructor() { }
      translate() { }
      dispose() { }
    },
    ConeGeometry: class {
      parameters: any;
      constructor() { }
      translate() { }
      dispose() { }
    },
    BoxGeometry: class {
      translate() { }
      getIndex() { return null; }
      getAttribute() { return { count: 0, itemSize: 3, array: [] }; }
      clone() { return this; }
      dispose() { }
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
          }
        };
      }
      computeVertexNormals = vi.fn();
      dispose() { }
    },
    BufferGeometry: class {
      attributes = {
        position: {
          array: [],
          needsUpdate: false,
          count: 0,
          itemSize: 3,
          getX: vi.fn(),
          getY: vi.fn(),
          getZ: vi.fn(),
          setXYZ: vi.fn(),
        },
      };
      setAttribute() { }
      setFromPoints() { }
      getIndex() { return null; }
      getAttribute() { return this.attributes.position; }
      computeBoundingSphere() { }
      dispose() { }
    },
    EdgesGeometry: class {
      constructor() { }
      scale = { set: vi.fn() };
      dispose() { }
    },
    Mesh: class {
      position = {
        x: 0,
        y: 0,
        z: 0,
        set: vi.fn(function(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }),
        copy: vi.fn(function(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }),
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
      add() { }
      remove() { }
      removeFromParent() { }
      traverse(cb: any) { cb(this); }
      lookAt() { }
      dispatchEvent() { }
      addEventListener() { }
      removeEventListener() { }
    },
    Group: class {
      position = {
        x: 0,
        y: 0,
        z: 0,
        set: vi.fn(function(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }),
        copy: vi.fn(function(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }),
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
        // Add minimal lookAt support for children
        if (obj && !obj.lookAt) obj.lookAt = vi.fn();
      }
      remove(obj: any) {
        this.children = this.children.filter((c) => c !== obj);
      }
      removeFromParent() { }
      traverse(cb: any) {
        cb(this);
        this.children.forEach((c) => c.traverse && c.traverse(cb));
      }
      lookAt = vi.fn(); // Added lookAt to Group
      dispatchEvent() { }
      addEventListener() { }
      removeEventListener() { }
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
      clone() { return this; }
      dispose() { }
    },
    MeshLambertMaterial: class {
      clone() { return this; }
      dispose() { }
    },
    MeshBasicMaterial: class {
      color = { getHex: vi.fn(() => 0xffffff) };
      constructor(params?: any) {
        if (params?.color !== undefined) this.color.getHex = vi.fn(() => params.color);
      }
      clone() { return this; }
      dispose() { }
    },
    LineBasicMaterial: class {
      dispose() { }
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
      add() { }
      removeFromParent() { }
      dispatchEvent() { }
      addEventListener() { }
      removeEventListener() { }
    },
    PointsMaterial: class {
      dispose() { }
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
          color: { // Added color attribute support
            array: [],
            needsUpdate: false,
            setXYZ: vi.fn(),
          }
        },
        dispose: vi.fn(), // Added dispose to geometry
      };
      material = {
        dispose: vi.fn(), // Added dispose to material
      };
      frustumCulled = true;
      isObject3D = true;
      add() { }
      removeFromParent() { }
      dispatchEvent() { }
      addEventListener() { }
      removeEventListener() { }
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
      add() { }
      remove() { }
      removeFromParent() { }
      dispose() { }
      dispatchEvent() { }
      addEventListener() { }
      removeEventListener() { }
    },
    PointLight: class {
      position = { set: vi.fn(), copy: vi.fn() };
      color = { getHex: vi.fn(() => 0xff0000) };
      userData = {};
      visible = true;
      isObject3D = true;
      constructor(color?: any, intensity?: any, distance?: any) {
        if (color !== undefined) this.color.getHex = vi.fn(() => color);
      }
      traverse(cb: any) { cb(this); }
      add() { }
      remove() { }
      removeFromParent() { }
      dispose() { }
      dispatchEvent() { }
      addEventListener() { }
      removeEventListener() { }
    },
    HemisphereLight: class {
      position = { set: vi.fn(), copy: vi.fn() };
      isObject3D = true;
      constructor() { }
      add() { }
      remove() { }
      removeFromParent() { }
      dispose() { }
    },
    PCFSoftShadowMap: 2,
    ACESFilmicToneMapping: 4,
  };
});

vi.mock("three/examples/jsm/postprocessing/EffectComposer", () => ({
  EffectComposer: class {
    constructor() {}
    addPass = vi.fn();
    render = vi.fn();
    setSize = vi.fn();
  }
}));

vi.mock("three/examples/jsm/postprocessing/RenderPass", () => ({
  RenderPass: class {
    constructor() {}
  }
}));

vi.mock("three/examples/jsm/postprocessing/UnrealBloomPass", () => ({
  UnrealBloomPass: class {
    constructor() {}
  }
}));

vi.mock("three/examples/jsm/postprocessing/OutputPass", () => ({
  OutputPass: class {
    constructor() {}
  }
}));

vi.stubGlobal("requestAnimationFrame", vi.fn((cb) => setTimeout(cb, 16)));
vi.stubGlobal("cancelAnimationFrame", vi.fn((id) => clearTimeout(id)));

vi.stubGlobal("ResizeObserver", class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
});

vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(""),
  ok: true,
  headers: {
    get: vi.fn(),
  },
})));

vi.stubGlobal("AudioContext", class AudioContext {
  state = "suspended";
  currentTime = 0;
  createOscillator() {
    return {
      type: "sine",
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
  }
  createBiquadFilter() {
    return {
      type: "lowpass",
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), value: 0 },
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
    this.state = "running";
    return Promise.resolve();
  }
  suspend() {
    this.state = "suspended";
    return Promise.resolve();
  }
  close() { // Added close method
    this.state = "closed";
    return Promise.resolve();
  }
  destination = {};
  sampleRate = 44100;
});
vi.stubGlobal("webkitAudioContext", (globalThis as any).AudioContext);
