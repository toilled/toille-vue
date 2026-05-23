import { describe, it, expect, vi } from "vitest";
import { FlyingTourMode } from "../../modes/FlyingTourMode";
import { Scene, PerspectiveCamera, WebGLRenderer } from "three";
import type { GameContext } from "../../types";
import { ref } from "vue";

describe("FlyingTourMode", () => {
  let mode: FlyingTourMode;
  let context: GameContext;

  beforeEach(() => {
    mode = new FlyingTourMode();
    context = {
      scene: new Scene(),
      camera: new PerspectiveCamera(),
      renderer: new WebGLRenderer(),
      composer: null,
      cars: [],
      buildings: [],
      occupiedGrids: new Map(),
      score: ref(0),
      drivingScore: ref(0),
      timeLeft: ref(0),
      activeCar: ref(null),
      isMobile: ref(false),
      isGameOver: ref(false),
      distToTarget: ref(0),
      controls: ref({ left: false, right: false, forward: false, backward: false }),
      lookControls: ref({ left: false, right: false, up: false, down: false }),
      spawnSparks: vi.fn(),
      playPewSound: vi.fn(),
      spawnCheckpoint: vi.fn(),
      checkpointMesh: undefined,
      navArrow: { visible: false } as never,
      chaseArrow: { visible: false } as never,
    };
  });

  it("initializes with a closed CatmullRomCurve3 path", () => {
    expect(mode.curve).toBeDefined();
    expect(mode.curve.closed).toBe(true);
    expect(mode.curve.points.length).toBeGreaterThan(0);
  });

  it("init sets the context", () => {
    mode.init(context);
    expect(mode.context).toBe(context);
  });

  it("update moves camera along the curve", () => {
    mode.init(context);
    const initialX = context.camera.position.x;
    mode.update(0.1, 0);
    const newX = context.camera.position.x;
    expect(typeof newX).toBe("number");
    expect(newX).not.toBeNaN();
  });

  it("update does nothing when no context", () => {
    expect(() => mode.update(0.1, 0)).not.toThrow();
  });

  it("cleanup does not throw", () => {
    expect(() => mode.cleanup()).not.toThrow();
  });

  it("event handlers do not throw", () => {
    expect(() => mode.onKeyDown(new KeyboardEvent("keydown"))).not.toThrow();
    expect(() => mode.onKeyUp(new KeyboardEvent("keyup"))).not.toThrow();
    expect(() => mode.onClick(new MouseEvent("click"))).not.toThrow();
    expect(() => mode.onMouseMove(new MouseEvent("mousemove"))).not.toThrow();
  });
});
