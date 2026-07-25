import { createECSWorld, ECSWorld, runSystems, addSystem } from './types';
import { TrafficSystem } from './systems/TrafficSystem';
import { GangWarSystem } from './systems/GangWarSystem';
import { MultiplayerSystem } from './systems/MultiplayerSystem';
import { StorySystem } from './systems/StorySystem';
import { GameModeSystem } from './systems/GameModeSystem';
import { drivingModeComponent } from './modes/DrivingMode';
import { explorationModeComponent } from './modes/ExplorationMode';
import { demoModeComponent } from './modes/DemoMode';
import { Scene, PerspectiveCamera, WebGLRenderer, Group, Vector3 } from 'three';
import { GameModeType, GameContext } from '../game/types';
import { CarFactory } from '../game/CarFactory';

export class GameECS {
  private world: ECSWorld;
  private gameModeSystem: GameModeSystem;
  private trafficSystem: TrafficSystem;
  private gangWarSystem: GangWarSystem;
  private multiplayerSystem: MultiplayerSystem;
  private storySystem: StorySystem;
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  private isRunning: boolean = false;

  constructor(
    scene: Scene,
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
    composer: any,
    cars: Group[],
    buildings: any[],
    occupiedGrids: Map<string, any>,
    score: any,
    drivingScore: any,
    timeLeft: any,
    activeCar: any,
    isMobile: any,
    isGameOver: any,
    distToTarget: any,
    controls: any,
    lookControls: any,
    spawnSparks: (position: Vector3) => void,
    playPewSound: (position?: Vector3) => void,
    spawnCheckpoint: () => void,
    reportCheckpoint: () => void,
    checkpointMesh: any,
    navArrow: Group,
    chaseArrow: Group,
    storyState: any,
    minimapData: any,
    updateObjective: (missionIdx: number, objIdx: number) => void,
    advanceDialogue: () => void,
    dismissBriefing: () => void,
    nearStoryTrigger: any,
    activateStoryTrigger: () => void,
    carFactory: CarFactory,
    carAudio: any
  ) {
    this.world = createECSWorld();

    this.world.resources.scene = scene;
    this.world.resources.camera = camera;
    this.world.resources.renderer = renderer;
    this.world.resources.composer = composer;
    this.world.resources.cars = cars;
    this.world.resources.buildings = buildings;
    this.world.resources.occupiedGrids = occupiedGrids;
    this.world.resources.score = score;
    this.world.resources.drivingScore = drivingScore;
    this.world.resources.timeLeft = timeLeft;
    this.world.resources.activeCar = activeCar;
    this.world.resources.isMobile = isMobile;
    this.world.resources.isGameOver = isGameOver;
    this.world.resources.distToTarget = distToTarget;
    this.world.resources.controls = controls;
    this.world.resources.lookControls = lookControls;
    this.world.resources.spawnSparks = spawnSparks;
    this.world.resources.playPewSound = playPewSound;
    this.world.resources.spawnCheckpoint = spawnCheckpoint;
    this.world.resources.reportCheckpoint = reportCheckpoint;
    this.world.resources.checkpointMesh = checkpointMesh;
    this.world.resources.navArrow = navArrow;
    this.world.resources.chaseArrow = chaseArrow;
    this.world.resources.storyState = storyState;
    this.world.resources.minimapData = minimapData;
    this.world.resources.updateObjective = updateObjective;
    this.world.resources.advanceDialogue = advanceDialogue;
    this.world.resources.dismissBriefing = dismissBriefing;
    this.world.resources.nearStoryTrigger = nearStoryTrigger;
    this.world.resources.activateStoryTrigger = activateStoryTrigger;
    this.world.resources.carAudio = carAudio;

    this.gameModeSystem = new GameModeSystem();
    this.gameModeSystem.registerMode('driving', drivingModeComponent);
    this.gameModeSystem.registerMode('exploration', explorationModeComponent);
    this.gameModeSystem.registerMode('demo', demoModeComponent);

    this.trafficSystem = new TrafficSystem(scene, 30, (pos) =>
      spawnSparks(new Vector3(pos.x, pos.y, pos.z))
    );
    this.gangWarSystem = new GangWarSystem(scene, occupiedGrids, spawnSparks, playPewSound);
    const onlineCount = { value: 0 };
    this.multiplayerSystem = new MultiplayerSystem(scene, onlineCount, carFactory);
    this.storySystem = new StorySystem(storyState);

    addSystem(this.world, this.gameModeSystem);
    addSystem(this.world, this.trafficSystem);
    addSystem(this.world, this.gangWarSystem);
    addSystem(this.world, this.multiplayerSystem);
    addSystem(this.world, this.storySystem);

    this.trafficSystem.init(this.world);
    this.gangWarSystem.init(this.world);
    this.storySystem.init(this.world);
    this.multiplayerSystem.init(this.world);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  private gameLoop(currentTime: number) {
    if (!this.isRunning) return;

    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    runSystems(this.world, dt, currentTime / 1000);

    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  setMode(mode: GameModeType) {
    this.gameModeSystem.setMode(this.world, mode);
  }

  clearMode() {
    this.gameModeSystem.clearMode(this.world);
  }

  onKeyDown(event: KeyboardEvent) {
    this.gameModeSystem.onKeyDown(this.world, event);
  }

  onKeyUp(event: KeyboardEvent) {
    this.gameModeSystem.onKeyUp(this.world, event);
  }

  onClick(event: MouseEvent) {
    this.gameModeSystem.onClick(this.world, event);
  }

  onMouseMove(event: MouseEvent) {
    this.gameModeSystem.onMouseMove(this.world, event);
  }

  broadcastMultiplayer(
    x: number,
    y: number,
    z: number,
    heading: number,
    state: 'walking' | 'driving'
  ) {
    this.multiplayerSystem.broadcast(x, y, z, heading, state);
  }

  getWorld(): ECSWorld {
    return this.world;
  }

  dispose() {
    this.stop();
    this.multiplayerSystem.dispose();
    this.gangWarSystem.dispose();
  }
}

export function createGameECS(context: GameContext, carAudio: any): GameECS {
  return new GameECS(
    context.scene,
    context.camera,
    context.renderer,
    context.composer,
    context.cars,
    context.buildings,
    context.occupiedGrids,
    context.score,
    context.drivingScore,
    context.timeLeft,
    context.activeCar,
    context.isMobile,
    context.isGameOver,
    context.distToTarget,
    context.controls,
    context.lookControls,
    context.spawnSparks,
    context.playPewSound,
    context.spawnCheckpoint,
    context.reportCheckpoint,
    context.checkpointMesh,
    context.navArrow,
    context.chaseArrow,
    context.storyState!,
    context.minimapData!,
    context.updateObjective!,
    context.advanceDialogue!,
    context.dismissBriefing!,
    context.nearStoryTrigger!,
    context.activateStoryTrigger!,
    new CarFactory(),
    carAudio
  );
}
