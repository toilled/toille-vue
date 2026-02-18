import { mount, VueWrapper } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import CyberpunkCity from '../components/CyberpunkCity.vue'
import * as THREE from 'three'

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

// Mock useRoute
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    path: '/'
  }))
}))

vi.stubGlobal("requestAnimationFrame", vi.fn((cb) => setTimeout(cb, 16)));
vi.stubGlobal("cancelAnimationFrame", vi.fn((id) => clearTimeout(id)));
vi.stubGlobal("ResizeObserver", class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
});

// Mock Three.js
vi.mock('three', () => {
  const THREE = {
    Scene: vi.fn(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      fog: null,
      background: null
    })),
    PerspectiveCamera: vi.fn(() => ({
      position: { set: vi.fn(), x: 0, y: 0, z: 0, copy: vi.fn(), distanceTo: vi.fn(), lerp: vi.fn() },
      rotation: { set: vi.fn(), copy: vi.fn(), x: 0, y: 0, z: 0 },
      quaternion: { slerp: vi.fn() },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn()
    })),
    WebGLRenderer: vi.fn(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      domElement: document.createElement('canvas'),
      setPixelRatio: vi.fn(),
      dispose: vi.fn(),
      shadowMap: { enabled: false, type: 0 },
      toneMapping: 0,
      toneMappingExposure: 1
    })),
    WebGLRenderTarget: vi.fn(() => ({
      texture: {},
      setSize: vi.fn(),
      dispose: vi.fn(),
      samples: 0
    })),
    Color: vi.fn(() => ({
      setHSL: vi.fn(function() { return this; }),
      setHex: vi.fn(),
      getHex: vi.fn(() => 0),
    })),
    FogExp2: vi.fn(),
    BoxGeometry: vi.fn(() => ({
      translate: vi.fn()
    })),
    CylinderGeometry: vi.fn(() => ({
      rotateX: vi.fn(),
      rotateZ: vi.fn(),
      translate: vi.fn()
    })),
    SphereGeometry: vi.fn(),
    ConeGeometry: vi.fn(() => ({
      translate: vi.fn()
    })),
    EdgesGeometry: vi.fn(),
    PlaneGeometry: vi.fn(() => ({
        attributes: {
            position: {
                count: 100,
                getX: vi.fn(() => 0),
                getY: vi.fn(() => 0),
                getZ: vi.fn(() => 0),
                setZ: vi.fn()
            }
        },
        computeVertexNormals: vi.fn()
    })),
    BufferGeometry: vi.fn(() => ({
      setAttribute: vi.fn(),
      setFromPoints: vi.fn()
    })),
    MeshBasicMaterial: vi.fn(() => ({
      clone: vi.fn(() => ({
        clone: vi.fn()
      }))
    })),
    MeshLambertMaterial: vi.fn(() => ({
      clone: vi.fn(() => ({
        clone: vi.fn()
      }))
    })),
    MeshStandardMaterial: vi.fn(() => ({
      clone: vi.fn(() => ({
        clone: vi.fn()
      }))
    })),
    PointsMaterial: vi.fn(),
    LineBasicMaterial: vi.fn(),
    LineSegments: vi.fn(() => ({
      position: { set: vi.fn(), copy: vi.fn(), x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { set: vi.fn() }
    })),
    Line: vi.fn(),
    Group: vi.fn(() => ({
      add: vi.fn(),
      position: {
        set: vi.fn(),
        x: 0, y: 0, z: 0,
        copy: vi.fn(),
        distanceToSquared: vi.fn(() => 100), // Added
        distanceTo: vi.fn(() => 10), // Added
        clone: vi.fn(() => ({
            add: vi.fn(function() { return this; }),
            sub: vi.fn(function() { return this; }),
            normalize: vi.fn(function() { return this; }),
            multiplyScalar: vi.fn(function() { return this; }),
            x: 0, y: 0, z: 0,
            clone: vi.fn(function() { return this; }),
            distanceTo: vi.fn(() => 10)
        })),
        add: vi.fn(),
        sub: vi.fn(),
        normalize: vi.fn(),
        multiplyScalar: vi.fn()
      },
      rotation: { x: 0, y: 0, z: 0 },
      up: { x: 0, y: 1, z: 0, set: vi.fn(), copy: vi.fn() },
      traverse: vi.fn(),
      userData: {},
      lookAt: vi.fn()
    })),
    DoubleSide: 2,
    Mesh: vi.fn(() => ({
      position: {
        set: vi.fn(),
        x: 0, y: 0, z: 0,
        distanceToSquared: vi.fn(),
        copy: vi.fn(), // Added copy
        clone: vi.fn(() => ({ sub: vi.fn(), normalize: vi.fn(), add: vi.fn() })),
        add: vi.fn()
      },
      rotation: { x: 0, y: 0, z: 0 },
      up: { x: 0, y: 1, z: 0, set: vi.fn(), copy: vi.fn() },
      scale: { set: vi.fn() },
      userData: {},
      add: vi.fn(),
      lookAt: vi.fn(),
      material: { color: { setHex: vi.fn() } }, // Added material.color
      traverse: vi.fn()
    })),
    Points: vi.fn(() => ({
      position: { set: vi.fn(), x: 0, y: 0, z: 0 },
      geometry: {
        attributes: {
          position: {
            array: new Float32Array(3000), // Mock size
            needsUpdate: false
          },
          color: {
            array: new Float32Array(3000),
            needsUpdate: false,
            setXYZ: vi.fn()
          }
        },
        dispose: vi.fn()
      },
      material: {
        dispose: vi.fn()
      }
    })),
    Float32BufferAttribute: vi.fn(),
    BufferAttribute: vi.fn(),
    CanvasTexture: vi.fn(() => ({
      wrapS: 0,
      wrapT: 0,
      magFilter: 0,
      anisotropy: 0,
      repeat: {
        set: vi.fn()
      },
      offset: {
        set: vi.fn()
      }
    })),
    RepeatWrapping: 1000,
    NearestFilter: 1001,
    MathUtils: {
      randFloatSpread: vi.fn(() => 100),
      randFloat: vi.fn(() => 100)
    },
    AmbientLight: vi.fn(),
    HemisphereLight: vi.fn(() => ({
      position: { set: vi.fn() },
      add: vi.fn()
    })),
    PointLight: vi.fn(() => ({
      position: { set: vi.fn(), x: 0, y: 0, z: 0 },
      userData: {},
      visible: true,
      color: { getHex: vi.fn() }
    })),
    DirectionalLight: vi.fn(() => ({
      position: { set: vi.fn(), x: 0, y: 0, z: 0 },
      castShadow: false,
      shadow: {
        mapSize: { width: 1024, height: 1024 },
        camera: { near: 0, far: 0, left: 0, right: 0, top: 0, bottom: 0 },
        bias: 0
      }
    })),
    SpotLight: vi.fn(() => ({
      position: { set: vi.fn(), x: 0, y: 0, z: 0 },
      target: { position: { set: vi.fn(), x: 0, y: 0, z: 0 } },
      userData: {},
      add: vi.fn()
    })),
    Object3D: vi.fn(() => ({
      position: { set: vi.fn(), x: 0, y: 0, z: 0 },
      add: vi.fn(),
      traverse: vi.fn()
    })),
    Quaternion: vi.fn(() => ({
      setFromEuler: vi.fn(),
      slerp: vi.fn()
    })),
    Vector3: vi.fn(() => ({
      x: 0,
      y: 0,
      z: 0,
      lerp: vi.fn(),
      subVectors: vi.fn(),
      normalize: vi.fn(),
      multiplyScalar: vi.fn(),
      divideScalar: vi.fn(),
      applyEuler: vi.fn()
    })),
    Vector2: vi.fn(),
    Raycaster: vi.fn(() => ({
      setFromCamera: vi.fn(),
      intersectObjects: vi.fn(() => []),
      intersectObject: vi.fn(() => []),
      params: { Points: { threshold: 1 } }
    })),
    AdditiveBlending: 2000,
    PCFSoftShadowMap: 1,
    ACESFilmicToneMapping: 1,
    Euler: vi.fn(() => ({
      set: vi.fn(),
      copy: vi.fn()
    }))
  }
  return THREE
})

describe('CyberpunkCity.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Mock canvas context
    const mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      shadowColor: '',
      shadowBlur: 0,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      clearRect: vi.fn(),
      scale: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as any);

  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly', () => {
    wrapper = mount(CyberpunkCity)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('div').exists()).toBe(true)
  })

  it('initializes Three.js scene on mount', () => {
    wrapper = mount(CyberpunkCity)
    expect(THREE.Scene).toHaveBeenCalled()
    expect(THREE.PerspectiveCamera).toHaveBeenCalled()
    expect(THREE.WebGLRenderer).toHaveBeenCalled()
  })

  it('cleans up on unmount', () => {
    wrapper = mount(CyberpunkCity)
    wrapper.unmount()
    // Verification of cleanup would depend on implementation details,
    // but ensuring no errors on unmount is a good basic check.
  })

  it('initializes spark positions off-screen', () => {
    wrapper = mount(CyberpunkCity)

    const calls = (THREE.BufferAttribute as any).mock.calls;
    let sparksCallFound = false;

    for (const call of calls) {
        const array = call[0];
        const itemSize = call[1];

        // Check if this is the sparks array (length 6000)
        // sparkCount is 2000, so array length is 6000
        if (array.length === 6000 && itemSize === 3) {
            sparksCallFound = true;
            // Verify Y coordinate is off-screen
            // x, y, z. So index 1 is y.
            // Check first particle
            expect(array[1]).toBeLessThan(-9000);
            // Check second particle
            expect(array[4]).toBeLessThan(-9000);
            // Check last particle
            expect(array[5998]).toBeLessThan(-9000);
        }
    }

    expect(sparksCallFound).toBe(true);
  })
})
