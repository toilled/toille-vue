import { render } from '@testing-library/svelte'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import CyberpunkCity from '../components/CyberpunkCity.svelte'
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

vi.mock('../router', () => ({
  path: { subscribe: (fn: any) => { fn('/'); return () => {}; } }
}));

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
    Color: vi.fn(),
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
        distanceToSquared: vi.fn(() => 100),
        distanceTo: vi.fn(() => 10),
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
        copy: vi.fn(),
        clone: vi.fn(() => ({ sub: vi.fn(), normalize: vi.fn(), add: vi.fn() })),
        add: vi.fn()
      },
      rotation: { x: 0, y: 0, z: 0 },
      up: { x: 0, y: 1, z: 0, set: vi.fn(), copy: vi.fn() },
      scale: { set: vi.fn() },
      userData: {},
      add: vi.fn(),
      lookAt: vi.fn(),
      material: { color: { setHex: vi.fn() } },
      traverse: vi.fn()
    })),
    Points: vi.fn(() => ({
      position: { set: vi.fn(), x: 0, y: 0, z: 0 },
      geometry: {
        attributes: {
          position: {
            array: new Float32Array(6000), // sparkCount * 3
            needsUpdate: false
          },
          color: {
            array: new Float32Array(6000),
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

describe('CyberpunkCity.svelte', () => {
  beforeEach(() => {
    vi.clearAllMocks()

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
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as any);
  })

  it('renders correctly', () => {
    const { container } = render(CyberpunkCity)
    expect(container.querySelector('div')).toBeTruthy()
  })

  it('initializes Three.js scene on mount', () => {
    render(CyberpunkCity)
    expect(THREE.Scene).toHaveBeenCalled()
    expect(THREE.PerspectiveCamera).toHaveBeenCalled()
    expect(THREE.WebGLRenderer).toHaveBeenCalled()
  })

  it('cleans up on unmount', () => {
    const { unmount } = render(CyberpunkCity)
    unmount()
  })

  it('initializes spark positions off-screen', () => {
    render(CyberpunkCity)

    const calls = (THREE.BufferAttribute as any).mock.calls;
    let sparksCallFound = false;

    for (const call of calls) {
        const array = call[0];
        const itemSize = call[1];

        if (array.length === 6000 && itemSize === 3) {
            sparksCallFound = true;
            expect(array[1]).toBeLessThan(-9000);
            expect(array[4]).toBeLessThan(-9000);
            expect(array[5998]).toBeLessThan(-9000);
        }
    }

    expect(sparksCallFound).toBe(true);
  })
})
