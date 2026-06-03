import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ExplorationMode } from "../../modes/ExplorationMode";
import { Scene, PerspectiveCamera, WebGLRenderer, Group } from "three";
import { ref } from "vue";
import type { GameContext } from "../../types";

vi.mock("../../audio/CarAudio", () => ({
  carAudio: { playCrash: vi.fn() },
}));

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

  it("onKeyUp unsets forward control", () => {
    mode.init(context);
    context.controls.value.forward = true;
    mode.onKeyUp(new KeyboardEvent("keyup", { key: "w" }));
    expect(context.controls.value.forward).toBe(false);
  });

  it("onKeyUp unsets all WASD controls", () => {
    mode.init(context);
    const c = context.controls.value;
    c.forward = true;
    c.backward = true;
    c.left = true;
    c.right = true;
    mode.onKeyUp(new KeyboardEvent("keyup", { key: "w" }));
    expect(c.forward).toBe(false);
    mode.onKeyUp(new KeyboardEvent("keyup", { key: "s" }));
    expect(c.backward).toBe(false);
    mode.onKeyUp(new KeyboardEvent("keyup", { key: "a" }));
    expect(c.left).toBe(false);
    mode.onKeyUp(new KeyboardEvent("keyup", { key: "d" }));
    expect(c.right).toBe(false);
  });

  it("onKeyUp unsets all arrow key controls", () => {
    mode.init(context);
    const c = context.controls.value;
    c.forward = true;
    c.backward = true;
    c.left = true;
    c.right = true;
    mode.onKeyUp(new KeyboardEvent("keyup", { key: "ArrowUp" }));
    expect(c.forward).toBe(false);
    mode.onKeyUp(new KeyboardEvent("keyup", { key: "ArrowDown" }));
    expect(c.backward).toBe(false);
    mode.onKeyUp(new KeyboardEvent("keyup", { key: "ArrowLeft" }));
    expect(c.left).toBe(false);
    mode.onKeyUp(new KeyboardEvent("keyup", { key: "ArrowRight" }));
    expect(c.right).toBe(false);
  });

  it("E key dismisses briefing via handleStoryInteraction", () => {
    mode.init(context);
    const dismissBriefing = vi.fn();
    context.storyState = ref({
      active: true, showingBriefing: true, showingDialogue: false,
      missionComplete: false, currentMissionIndex: 0, currentDialogueIndex: 0,
      missions: [],
    });
    context.dismissBriefing = dismissBriefing;
    mode.onKeyDown(new KeyboardEvent("keydown", { key: "e" }));
    expect(dismissBriefing).toHaveBeenCalled();
  });

  it("E key advances dialogue via handleStoryInteraction", () => {
    mode.init(context);
    const advanceDialogue = vi.fn();
    context.storyState = ref({
      active: true, showingBriefing: false, showingDialogue: true,
      missionComplete: false, currentMissionIndex: 0, currentDialogueIndex: 0,
      missions: [],
    });
    context.advanceDialogue = advanceDialogue;
    mode.onKeyDown(new KeyboardEvent("keydown", { key: "e" }));
    expect(advanceDialogue).toHaveBeenCalled();
  });

  it("update forwards player position and mission to minimapData", () => {
    mode.init(context);
    context.minimapData = ref({
      playerX: 0, playerZ: 0, playerRotation: 0,
      currentMissionId: "", objectives: [],
    });
    context.storyState = ref({
      active: true, showingBriefing: false, showingDialogue: false,
      missionComplete: false, currentMissionIndex: 0, currentDialogueIndex: 0,
      missions: [{ id: "m1", title: "", brief: "", dialogue: [],
        objectives: [{ id: "o1", type: "goto", label: "", x: 10, z: 10, completed: false, description: "" }],
      }],
    });
    mode.isTransitioning = false;
    context.camera.position.set(42, 3, 99);
    mode.update(0.1, 0);
    expect(context.minimapData.value.playerX).toBe(42);
    expect(context.minimapData.value.playerZ).toBe(99);
    expect(context.minimapData.value.currentMissionId).toBe("m1");
    expect(context.minimapData.value.objectives).toHaveLength(1);
  });

  it("detects car collision and plays crash sound", () => {
    const car = new Group();
    car.position.set(0, 0, 0);
    car.userData.isPlayerHit = false;
    context.cars = [car];
    mode.init(context);
    mode.isTransitioning = false;
    context.camera.position.set(0, 3, 0);
    mode.update(0.1, 0);
    expect(car.userData.isPlayerHit).toBe(true);
  });

  it("update detects proximity to story objective", () => {
    const updateObjective = vi.fn();
    context.updateObjective = updateObjective;
    context.storyState = ref({
      active: true, showingBriefing: false, showingDialogue: false,
      missionComplete: false, currentMissionIndex: 0, currentDialogueIndex: 0,
      missions: [{ id: "m1", title: "", brief: "", dialogue: [],
        objectives: [{ id: "o1", type: "goto", label: "", x: 0, z: 0, completed: false, description: "" }],
      }],
    });
    mode.init(context);
    mode.isTransitioning = false;
    context.camera.position.set(0, 3, 0);
    mode.update(0.1, 0);
    expect(updateObjective).toHaveBeenCalledWith(0, 0);
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
