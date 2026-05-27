import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ExplorationMode } from "../../modes/ExplorationMode";
import { Scene, PerspectiveCamera, WebGLRenderer } from "three";
import { ref } from "vue";
import type { GameContext } from "../types";

vi.mock("../../utils/HeightMap", () => ({
  getHeight: vi.fn(() => 0),
}));

describe("ExplorationMode", () => {
  let mode: ExplorationMode;
  let context: GameContext;

  beforeEach(() => {
    document.body.requestPointerLock = vi.fn();
    document.exitPointerLock = vi.fn();

    mode = new ExplorationMode();
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

  afterEach(() => {
    delete (document.body as { requestPointerLock?: unknown }).requestPointerLock;
    delete (document as { exitPointerLock?: unknown }).exitPointerLock;
  });

  it("init sets context and starts transition", () => {
    mode.init(context);
    expect(mode.context).toBe(context);
    expect(mode.isTransitioning).toBe(true);
  });

  it("update transitions camera to ground level", () => {
    mode.init(context);
    context.camera.position.set(0, 1000, 0);
    mode.update(0.1, 0);
    expect(context.camera.position.y).toBeLessThan(1000);
  });

  it("update does nothing when no context", () => {
    mode.init(context);
    mode.context = null;
    expect(() => mode.update(0.1, 0)).not.toThrow();
  });

  it("onKeyDown sets controls for WASD", () => {
    mode.init(context);
    const wEvent = new KeyboardEvent("keydown", { key: "w" });
    mode.onKeyDown(wEvent);
    expect(context.controls.value.forward).toBe(true);

    const aEvent = new KeyboardEvent("keydown", { key: "a" });
    mode.onKeyDown(aEvent);
    expect(context.controls.value.left).toBe(true);

    const sEvent = new KeyboardEvent("keydown", { key: "s" });
    mode.onKeyDown(sEvent);
    expect(context.controls.value.backward).toBe(true);

    const dEvent = new KeyboardEvent("keydown", { key: "d" });
    mode.onKeyDown(dEvent);
    expect(context.controls.value.right).toBe(true);
  });

  it("onKeyDown supports arrow keys", () => {
    mode.init(context);
    mode.onKeyDown(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    expect(context.controls.value.forward).toBe(true);
    mode.onKeyDown(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    expect(context.controls.value.backward).toBe(true);
    mode.onKeyDown(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    expect(context.controls.value.left).toBe(true);
    mode.onKeyDown(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(context.controls.value.right).toBe(true);
  });

  it("onKeyUp unsets controls", () => {
    mode.init(context);
    context.controls.value.forward = true;
    mode.onKeyUp(new KeyboardEvent("keyup", { key: "w" }));
    expect(context.controls.value.forward).toBe(false);
  });

  it("Space key triggers jump", () => {
    mode.init(context);
    mode.onKeyDown(new KeyboardEvent("keydown", { key: " ", code: "Space" }));
    expect(mode.isJumping).toBe(true);
    expect(mode.velocityY).toBe(mode.jumpStrength);
  });

  it("does not double-jump", () => {
    mode.init(context);
    mode.onKeyDown(new KeyboardEvent("keydown", { code: "Space" }));
    mode.isJumping = true;
    mode.velocityY = 0;
    mode.onKeyDown(new KeyboardEvent("keydown", { code: "Space" }));
    expect(mode.velocityY).toBe(0);
  });

  it("cleanup attempts to exit pointer lock", () => {
    mode.init(context);
    expect(() => mode.cleanup()).not.toThrow();
  });

  it("onClick requests pointer lock on desktop", () => {
    mode.init(context);
    mode.onClick(new MouseEvent("click"));
  });

  it("onMouseMove handles pointer lock rotation", () => {
    mode.init(context);
    mode.onMouseMove(new MouseEvent("mousemove", { movementX: 10, movementY: 5 }));
  });

  it("ignores input when no context", () => {
    mode.init(context);
    mode.context = null;
    expect(() => {
      mode.onKeyDown(new KeyboardEvent("keydown", { key: "w" }));
      mode.onKeyUp(new KeyboardEvent("keyup", { key: "w" }));
      mode.onClick(new MouseEvent("click"));
      mode.onMouseMove(new MouseEvent("mousemove"));
    }).not.toThrow();
  });

  it("handles mobile look controls", () => {
    context.isMobile.value = true;
    mode.init(context);
    context.camera.position.set(0, 3, 0);
    mode.isTransitioning = false;
    context.lookControls.value.left = true;
    mode.update(0.1, 0);
    expect(context.camera.rotation.y).not.toBe(0);
  });
});
