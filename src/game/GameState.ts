import { Group, Vector3 } from 'three';
import { Controls, LookControls, StoryState, MinimapData } from './types';

export class GameState {
  score = 0;
  drivingScore = 0;
  timeLeft = 30;
  activeCar: Group | null = null;
  isMobile = false;
  isGameOver = false;
  distToTarget = 0;
  controls: Controls = { left: false, right: false, forward: false, backward: false };
  lookControls: LookControls = { left: false, right: false, up: false, down: false };
  storyState: StoryState = {
    active: false,
    currentMissionIndex: 0,
    currentDialogueIndex: 0,
    showingDialogue: false,
    showingBriefing: false,
    missionComplete: false,
    missions: [],
  };
  minimapData: MinimapData = {
    playerX: 0,
    playerZ: 0,
    playerRotation: 0,
    objectives: [],
  };
  nearStoryTrigger = false;
  signalStrength = 0;
  showStoryHint = false;

  constructor(
    public scene: import('three').Scene,
    public camera: import('three').PerspectiveCamera,
    public renderer: import('three').WebGLRenderer,
    public composer: import('three/examples/jsm/postprocessing/EffectComposer.js').EffectComposer | null,
    public cars: Group[],
    public buildings: import('three').Object3D[],
    public occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>,
    public spawnSparks: (position: Vector3) => void,
    public playPewSound: () => void,
    public spawnCheckpoint: () => void,
    public reportCheckpoint: () => void,
    public checkpointMesh: import('three').Mesh | undefined,
    public navArrow: Group,
    public chaseArrow: Group,
    public updateObjective?: (missionIdx: number, objIdx: number) => void,
    public advanceDialogue?: () => void,
    public dismissBriefing?: () => void,
    public activateStoryTrigger?: () => void,
  ) {}
}

export function createGameState(context: import('./types').GameContext): GameState {
  return new GameState(
    context.scene,
    context.camera,
    context.renderer,
    context.composer,
    context.cars,
    context.buildings,
    context.occupiedGrids,
    context.spawnSparks,
    context.playPewSound,
    context.spawnCheckpoint,
    context.reportCheckpoint,
    context.checkpointMesh,
    context.navArrow,
    context.chaseArrow,
    context.updateObjective,
    context.advanceDialogue,
    context.dismissBriefing,
    context.activateStoryTrigger,
  );
}