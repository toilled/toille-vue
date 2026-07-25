import { World } from 'miniplex';
import type { Position, Velocity, Rotation, Health, AIState, MovementInput, LookInput, GameModeState, PlayerControl, CarPhysics, Vehicle, WarriorComponent, ProjectileComponent, GangConfigComponent, BuildingOccupancy, Score, TimeState, CameraState, SparkEmitter, SoundEmitter, CheckpointSystem, NavigationArrow, StoryTrigger, StorySystem, MinimapSystem, MultiplayerState, ThreeScene, GameModeEntity, InputState, CollisionComponent, RenderComponent, Lifetime, SpawnPoint, ObjectiveMarker } from './components';

export interface ECSEntity extends Record<string, any> {
  position?: Position;
  velocity?: Velocity;
  rotation?: Rotation;
  health?: Health;
  aiState?: AIState;
  movementInput?: MovementInput;
  lookInput?: LookInput;
  gameModeState?: GameModeState;
  playerControl?: PlayerControl;
  carPhysics?: CarPhysics;
  vehicle?: Vehicle;
  warrior?: WarriorComponent;
  projectile?: ProjectileComponent;
  gangConfig?: GangConfigComponent;
  buildingOccupancy?: BuildingOccupancy;
  score?: Score;
  timeState?: TimeState;
  cameraState?: CameraState;
  sparkEmitter?: SparkEmitter;
  soundEmitter?: SoundEmitter;
  checkpointSystem?: CheckpointSystem;
  navigationArrow?: NavigationArrow;
  storyTrigger?: StoryTrigger;
  storySystem?: StorySystem;
  minimapSystem?: MinimapSystem;
  multiplayerState?: MultiplayerState;
  threeScene?: ThreeScene;
  gameModeEntity?: GameModeEntity;
  inputState?: InputState;
  collision?: CollisionComponent;
  render?: RenderComponent;
  lifetime?: Lifetime;
  spawnPoint?: SpawnPoint;
  objectiveMarker?: ObjectiveMarker;
}

export interface ECSWorld extends World<ECSEntity> {
  systems: System[];
  resources: ECSResources;
}

export interface ECSResources {
  scene: any;
  camera: any;
  renderer: any;
  composer: any;
  cars: any[];
  buildings: any[];
  occupiedGrids: Map<string, any>;
  score: any;
  drivingScore: any;
  timeLeft: any;
  activeCar: any;
  isMobile: any;
  isGameOver: any;
  distToTarget: any;
  controls: any;
  lookControls: any;
  spawnSparks: (pos: any) => void;
  playPewSound: (pos?: any) => void;
  spawnCheckpoint: () => void;
  reportCheckpoint: () => void;
  checkpointMesh: any;
  navArrow: any;
  chaseArrow: any;
  carAudio: any;
  cyberpunkAudio: any;
  audioManager: any;
  STORY_TRIGGER_POSITION: any;
  BOUNDS: number;
  storyState: any;
  minimapData: any;
  updateObjective: (missionIdx: number, objIdx: number) => void;
  advanceDialogue: () => void;
  dismissBriefing: () => void;
  nearStoryTrigger: any;
  activateStoryTrigger: () => void;
  onlineCount: any;
  multiplayer: any;
  gameMode: any;
  gangWarCombat: any;
  gangWarMarkers: any;
  deltaTime: number;
  elapsedTime: number;
}

export abstract class System {
  abstract update(world: ECSWorld, dt: number, time: number): void;

  protected query<T extends ECSEntity>(world: World<T>, ...components: (keyof T)[]) {
    return world.with(...components);
  }

  protected queryOne<T extends ECSEntity>(world: World<T>, ...components: (keyof T)[]) {
    const results = world.with(...components);
    for (const entity of results) {
      return entity;
    }
    return undefined;
  }
}

export function createECSWorld(): ECSWorld {
  const world = new World<ECSEntity>() as ECSWorld;
  world.systems = [];
  world.resources = {
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    cars: [],
    buildings: [],
    occupiedGrids: new Map(),
    score: { value: 0 },
    drivingScore: { value: 0 },
    timeLeft: { value: 30 },
    activeCar: { value: null },
    isMobile: { value: false },
    isGameOver: { value: false },
    distToTarget: { value: 0 },
    controls: { value: { left: false, right: false, forward: false, backward: false } },
    lookControls: { value: { left: false, right: false, up: false, down: false } },
    spawnSparks: () => {},
    playPewSound: () => {},
    spawnCheckpoint: () => {},
    reportCheckpoint: () => {},
    checkpointMesh: undefined,
    navArrow: { mesh: { visible: true }, visible: true },
    chaseArrow: { visible: false },
    carAudio: { start: () => {}, stop: () => {}, update: () => {}, playCrash: () => {} },
    cyberpunkAudio: { addListener: () => {}, removeListener: () => {}, play: () => {}, pause: () => {} },
    audioManager: { isSoundEnabled: { value: true } },
    STORY_TRIGGER_POSITION: { x: 0, z: 0 },
    BOUNDS: 2000,
    storyState: {
      value: {
        active: false,
        currentMissionIndex: 0,
        currentDialogueIndex: 0,
        showingDialogue: false,
        showingBriefing: false,
        missionComplete: false,
        missions: [],
      },
    },
    minimapData: { value: { playerX: 0, playerZ: 0, playerRotation: 0, objectives: [] } },
    updateObjective: () => {},
    advanceDialogue: () => {},
    dismissBriefing: () => {},
    nearStoryTrigger: { value: false },
    activateStoryTrigger: () => {},
    onlineCount: { value: 0 },
    multiplayer: { myId: '', connected: false, players: new Map(), lastBroadcast: 0 },
    gameMode: {
      currentMode: null,
      previousMode: null,
      isTransitioning: false,
      transitionProgress: 1,
    },
    gangWarCombat: null,
    gangWarMarkers: null,
    deltaTime: 0,
    elapsedTime: 0,
  };
  return world;
}

export function addSystem(world: ECSWorld, system: System) {
  world.systems.push(system);
}

export function runSystems(world: ECSWorld, dt: number, time: number) {
  world.resources.deltaTime = dt;
  world.resources.elapsedTime = time;
  for (const system of world.systems) {
    system.update(world, dt, time);
  }
}