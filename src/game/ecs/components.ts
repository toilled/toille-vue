import { Group, Mesh, Scene, PerspectiveCamera, WebGLRenderer, Object3D } from 'three';
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import type { Ref } from 'vue';
import type { StoryState, MinimapData } from '../types';

// ── Transform ───────────────────────────────────────────────────────────────

export const Position = { x: [] as number[], y: [] as number[], z: [] as number[] };
export const Rotation = { y: [] as number[] };

// ── Physics ─────────────────────────────────────────────────────────────────

export const Velocity = { speed: [] as number[], angular: [] as number[] };

// ── Car ─────────────────────────────────────────────────────────────────────

export const CarState = {
  heading: [] as number[],
  maxSpeed: [] as number[],
  isPlayerControlled: [] as number[],
};

// ── Tags ────────────────────────────────────────────────────────────────────

export const PlayerControlled = {};
export const DrivingModeTag = {};
export const ExplorationModeTag = {};
export const DemoModeTag = {};
export const RedCarTag = {};

// ── Warrior ─────────────────────────────────────────────────────────────────

export const WarriorComp = {
  gangId: [] as number[],
  hp: [] as number[],
  state: [] as number[],
  targetId: [] as number[],
  cooldown: [] as number[],
  speed: [] as number[],
};

// ── Projectile ──────────────────────────────────────────────────────────────

export const ProjectileComp = {
  vx: [] as number[],
  vy: [] as number[],
  vz: [] as number[],
  life: [] as number[],
  shooterId: [] as number[],
};

// ── Scene references (AoS — per-entity Three.js objects) ────────────────────

export const SceneRef = [] as {
  group?: Group;
  mesh?: Mesh;
  head?: Mesh;
  body?: Mesh;
  gun?: Mesh;
}[];

// ── World-level context ─────────────────────────────────────────────────────

export type GameModeType = 'driving' | 'exploration' | 'demo' | null;

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  lookLeft: boolean;
  lookRight: boolean;
  lookUp: boolean;
  lookDown: boolean;
  jump: boolean;
}

export interface GameWorldContext {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  composer: EffectComposer | null;
  occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>;
  buildings: Object3D[];

  input: InputState;

  activeMode: GameModeType;

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

  playerEid: number;
  redCarEid: number;
}
