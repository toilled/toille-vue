import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Group,
  Vector3,
  Mesh,
  Object3D,
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
  buildings: Object3D[];
  occupiedGrids: Map<
    string,
    { halfW: number; halfD: number; isRound?: boolean }
  >;

  score: Ref<number>;
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
  reportCheckpoint: () => void;

  checkpointMesh: Mesh | undefined;
  navArrow: Group;
  chaseArrow: Group;

  storyState?: Ref<StoryState>;
  minimapData?: Ref<MinimapData>;
  updateObjective?: (missionIdx: number, objIdx: number) => void;
  advanceDialogue?: () => void;
  dismissBriefing?: () => void;
  nearStoryTrigger?: Ref<boolean>;
  activateStoryTrigger?: () => void;
}

export interface StoryObjective {
  id: string;
  type: "goto" | "collect" | "interact";
  label: string;
  x: number;
  z: number;
  completed: boolean;
  description: string;
}

export interface StoryMission {
  id: string;
  title: string;
  brief: string;
  dialogue: string[];
  objectives: StoryObjective[];
  completeMessage?: string;
}

export interface StoryState {
  active: boolean;
  currentMissionIndex: number;
  currentDialogueIndex: number;
  showingDialogue: boolean;
  showingBriefing: boolean;
  missionComplete: boolean;
  missions: StoryMission[];
}

export interface MinimapData {
  playerX: number;
  playerZ: number;
  playerRotation: number;
  objectives: { x: number; z: number; completed: boolean; label: string; type: string }[];
  currentMissionId: string;
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
