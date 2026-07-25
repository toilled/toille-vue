import {
  Vector3,
  Euler,
  Group,
  Mesh,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Object3D,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { Controls, LookControls, GameModeType, StoryState, MinimapData } from '../../game/types';

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Velocity {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
  order?: string;
}

export interface Health {
  current: number;
  max: number;
}

export interface AIState {
  state: 'IDLE' | 'COMBAT' | 'DEAD' | 'WALKING' | 'DRIVING' | 'CHASING' | 'FLEEING';
  target: any | null;
  cooldown: number;
}

export interface MovementInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
}

export interface LookInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export interface GameModeState {
  currentMode: GameModeType;
  previousMode: GameModeType | null;
  isTransitioning: boolean;
  transitionProgress: number;
}

export interface PlayerControl {
  isPlayerControlled: boolean;
  isActive: boolean;
}

export interface CarPhysics {
  currentSpeed: number;
  heading: number;
  maxSpeed: number;
  acceleration: number;
  braking: number;
  friction: number;
  turnSpeed: number;
}

export interface Vehicle {
  isPolice: boolean;
  isTruck: boolean;
  isFading: boolean;
  dir: number;
  fadingDir: number;
}

export interface WarriorComponent {
  gangId: number;
  speed: number;
  accuracy: number;
  head: Mesh;
  body: Mesh;
  gun: Mesh;
  flashTimerId: ReturnType<typeof setTimeout> | null;
}

export interface ProjectileComponent {
  velocity: Vector3;
  life: number;
  shooterId: number;
  damage: number;
}

export interface GangConfigComponent {
  id: number;
  color: number;
  name: string;
}

export interface BuildingOccupancy {
  halfW: number;
  halfD: number;
  isRound?: boolean;
}

export interface Score {
  value: number;
  drivingScore: number;
}

export interface TimeState {
  timeLeft: number;
  isGameOver: boolean;
}

export interface CameraState {
  position: Vector3;
  rotation: Euler;
  targetPosition: Vector3;
  targetRotation: Euler;
  isTransitioning: boolean;
  transitionProgress: number;
}

export interface SparkEmitter {
  spawn: (position: Vector3) => void;
}

export interface SoundEmitter {
  playPew: (position?: Vector3) => void;
  playCrash: () => void;
  updateCarAudio: (speed: number) => void;
  startCarAudio: () => void;
  stopCarAudio: () => void;
}

export interface CheckpointSystem {
  spawn: () => void;
  report: () => void;
  mesh: Mesh | undefined;
}

export interface NavigationArrow {
  mesh: Group;
  visible: boolean;
}

export interface StoryTrigger {
  isNear: boolean;
  activate: () => void;
}

export interface StorySystem {
  state: StoryState;
  updateObjective: (missionIdx: number, objIdx: number) => void;
  advanceDialogue: () => void;
  dismissBriefing: () => void;
}

export interface MinimapSystem {
  data: MinimapData;
}

export interface MultiplayerState {
  myId: string;
  connected: boolean;
  players: Map<string, RemotePlayer>;
  lastBroadcast: number;
}

export interface RemotePlayer {
  group: Group;
  targetPos: Vector3;
  targetHeading: number;
  lastUpdate: number;
  currentState: 'walking' | 'driving';
}

export interface ThreeScene {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  composer: EffectComposer | null;
  cars: Group[];
  buildings: Object3D[];
  occupiedGrids: Map<string, BuildingOccupancy>;
}

export interface GameModeEntity {
  type: GameModeType;
  entity: any;
}

export interface InputState {
  controls: Controls;
  lookControls: LookControls;
  isMobile: boolean;
  pointerLocked: boolean;
}

export interface CollisionComponent {
  radius: number;
  height: number;
  isTrigger: boolean;
}

export interface RenderComponent {
  object3d: Object3D | Group;
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
}

export interface Lifetime {
  maxLife: number;
  currentLife: number;
  autoDestroy: boolean;
}

export interface SpawnPoint {
  x: number;
  z: number;
  gangId?: number;
  count?: number;
}

export interface ObjectiveMarker {
  position: Vector3;
  completed: boolean;
  label: string;
  type: string;
}
