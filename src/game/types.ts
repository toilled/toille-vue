import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Group,
  Points,
  Vector3,
  Mesh,
} from "three";
import { Ref } from "vue";
import type { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

export interface Controls {
  left: boolean;
  right: boolean;
  forward: boolean;
  backward: boolean;
}

export interface LookControls {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export interface GameContext {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  composer: EffectComposer | null;

  cars: Group[];
  drones: Points | undefined;
  buildings: Group[];
  occupiedGrids: Map<
    string,
    { halfW: number; halfD: number; isRound?: boolean }
  >;

  score: Ref<number>;
  droneScore: Ref<number>;
  drivingScore: Ref<number>;
  timeLeft: Ref<number>;
  activeCar: Ref<Group | null>;
  isMobile: Ref<boolean>;
  isGameOver: Ref<boolean>;
  distToTarget: Ref<number>;

  controls: Ref<Controls>;
  lookControls: Ref<LookControls>;

  spawnSparks: (position: Vector3) => void;
  playPewSound: () => void;
  spawnCheckpoint: () => void;

  checkpointMesh: Mesh | undefined;
  navArrow: Group;
  chaseArrow: Group;
}

export interface GameMode {
  init(context: GameContext): void;
  update(dt: number, time: number): void;
  cleanup(): void;

  onKeyDown(event: KeyboardEvent): void;
  onKeyUp(event: KeyboardEvent): void;
  onClick(event: MouseEvent): void;
  onMouseMove(event: MouseEvent): void;
}
