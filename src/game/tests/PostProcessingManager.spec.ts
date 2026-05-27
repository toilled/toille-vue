import { describe, it, expect, vi } from "vitest";
import { Scene, PerspectiveCamera, WebGLRenderer, Vector2 } from "three";
import { setupPostProcessing } from "../PostProcessingManager";

vi.mock("three/examples/jsm/postprocessing/EffectComposer", () => ({
  EffectComposer: class {
    constructor() {}
    addPass = vi.fn();
    render = vi.fn();
    setSize = vi.fn();
  },
}));

vi.mock("three/examples/jsm/postprocessing/RenderPass", () => ({
  RenderPass: class {
    constructor() {}
  },
}));

vi.mock("three/examples/jsm/postprocessing/UnrealBloomPass", () => ({
  UnrealBloomPass: class {
    threshold = 0.85;
    strength = 1.5;
    radius = 0.4;
    constructor(_size: Vector2, _strength: number, _radius: number, _threshold: number) {}
  },
}));

vi.mock("three/examples/jsm/postprocessing/OutputPass", () => ({
  OutputPass: class {
    constructor() {}
  },
}));

describe("setupPostProcessing", () => {
  it("creates an EffectComposer with bloom and output passes", () => {
    const scene = new Scene();
    const camera = new PerspectiveCamera();
    const renderer = new WebGLRenderer();

    const composer = setupPostProcessing(scene, camera, renderer);
    expect(composer).toBeDefined();
    expect(composer.addPass).toHaveBeenCalled();
    expect(composer.render).toBeDefined();
  });
});
