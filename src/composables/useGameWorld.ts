import { type Ref } from 'vue';
import { createGameWorld } from '../game/ecs/world';
import { type GameWorldContext, type InputState } from '../game/ecs/components';
import { drivingPipeline, explorationPipeline, alwaysPipeline } from '../game/ecs/pipelines';
import {
  setDrivingMode,
  setExplorationMode,
  setDemoMode,
  clearMode,
} from '../game/ecs/modeManager';
import { handleControlsKeyDown, handleControlsKeyUp } from '../utils/controls';
import type { Scene, PerspectiveCamera, WebGLRenderer, Group, Mesh, Object3D } from 'three';
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import type { StoryState, MinimapData } from '../game/types';

export interface UseGameWorldOptions {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  composer: EffectComposer;
  occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>;
  buildings: Object3D[];
  score: Ref<number>;
  drivingScore: Ref<number>;
  timeLeft: Ref<number>;
  isGameOver: Ref<boolean>;
  distToTarget: Ref<number>;
  isMobile: Ref<boolean>;
  nearStoryTrigger: Ref<boolean>;
  activeCar: Ref<Group | null>;
  spawnSparks: (position: { x: number; y: number; z: number }) => void;
  playPewSound: () => void;
  spawnCheckpoint: () => void;
  reportCheckpoint: () => void;
  checkpointMesh: Mesh | undefined;
  navArrow: Group;
  chaseArrow: Group;
  storyState: Ref<StoryState>;
  minimapData: Ref<MinimapData>;
  updateObjective?: (missionIdx: number, objIdx: number) => void;
  advanceDialogue?: () => void;
  dismissBriefing?: () => void;
  activateStoryTrigger?: () => void;
}

export function useGameWorld(options: UseGameWorldOptions) {
  const input: InputState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    lookLeft: false,
    lookRight: false,
    lookUp: false,
    lookDown: false,
    jump: false,
  };

  const ctx: GameWorldContext = {
    ...options,
    input,
    activeMode: null,
    playerEid: 0,
    redCarEid: 0,
  };

  const world = createGameWorld(ctx);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      clearMode(world);
      return;
    }

    handleControlsKeyDown(input, event);

    if (event.code === 'Space') {
      input.jump = true;
    }
  }

  function onKeyUp(event: KeyboardEvent) {
    handleControlsKeyUp(input, event);
    if (event.code === 'Space') {
      input.jump = false;
    }
  }

  function onClick(_event: MouseEvent) {
    const ss = ctx.storyState?.value;
    if (ss?.showingBriefing && ctx.dismissBriefing) {
      ctx.dismissBriefing();
      return;
    }
    if (ss?.showingDialogue && ctx.advanceDialogue) {
      ctx.advanceDialogue();
      return;
    }
    if (ctx.nearStoryTrigger?.value && ctx.activateStoryTrigger) {
      ctx.activateStoryTrigger();
      return;
    }
    if (
      ctx.activeMode === 'exploration' &&
      !ctx.isMobile.value &&
      document.pointerLockElement !== document.body
    ) {
      document.body.requestPointerLock();
    }
  }

  function onMouseMove(event: MouseEvent) {
    if (ctx.activeMode !== 'exploration') return;
    if (ctx.isMobile.value) return;
    if (document.pointerLockElement !== document.body) return;

    const sensitivity = 0.002;
    const cam = ctx.camera;
    cam.rotation.y -= event.movementX * sensitivity;
    cam.rotation.x -= event.movementY * sensitivity;
    cam.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cam.rotation.x));
  }

  function update(dt: number, time: number) {
    world.time.delta = dt;
    world.time.elapsed = time;

    alwaysPipeline(world);

    if (ctx.activeMode === 'driving') {
      drivingPipeline(world);
    } else if (ctx.activeMode === 'exploration') {
      explorationPipeline(world);
    }
  }

  function startDriving() {
    setDrivingMode(world);
  }

  function startExploration() {
    setExplorationMode(world);
  }

  function startDemo() {
    setDemoMode(world);
  }

  function exitMode() {
    clearMode(world);
  }

  function dispose() {
    clearMode(world);
  }

  return {
    world,
    ctx,
    update,
    onKeyDown,
    onKeyUp,
    onClick,
    onMouseMove,
    startDriving,
    startExploration,
    startDemo,
    exitMode,
    dispose,
  };
}
