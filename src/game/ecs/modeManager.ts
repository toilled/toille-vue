import { addComponent, removeComponent } from 'bitecs';
import {
  DrivingModeTag,
  ExplorationModeTag,
  DemoModeTag,
  CarState,
  Position,
  type GameModeType,
} from './components';
import { resetExplorationState } from './systems/explorationMovementSystem';
import { carAudio } from '../audio/CarAudio';
import type { GameWorld } from './world';

export function setDrivingMode(world: GameWorld) {
  const { ctx } = world;
  const prev = ctx.activeMode;
  if (prev === 'driving') return;

  cleanupMode(world, prev);

  addComponent(world, ctx.playerEid, DrivingModeTag);

  const activeCar = ctx.activeCar.value;
  if (activeCar) {
    activeCar.userData.isPlayerControlled = true;
    activeCar.userData.currentSpeed = 0;

    if (activeCar.userData.heading === undefined) {
      activeCar.userData.heading = activeCar.rotation.y;
    }

    Position.x[ctx.playerEid] = activeCar.position.x;
    Position.y[ctx.playerEid] = activeCar.position.y;
    Position.z[ctx.playerEid] = activeCar.position.z;
    CarState.heading[ctx.playerEid] = activeCar.userData.heading;
    CarState.maxSpeed[ctx.playerEid] = 2;
    CarState.isPlayerControlled[ctx.playerEid] = 1;

    ctx.timeLeft.value = 30;
    ctx.isGameOver.value = false;
    ctx.spawnCheckpoint();
    carAudio.start();
  }

  ctx.activeMode = 'driving';
  resetInput(ctx);
}

export function setExplorationMode(world: GameWorld) {
  const { ctx } = world;
  const prev = ctx.activeMode;
  if (prev === 'exploration') return;

  cleanupMode(world, prev);

  addComponent(world, ctx.playerEid, ExplorationModeTag);
  resetExplorationState();

  if (!ctx.isMobile.value && ctx.renderer) {
    document.body.requestPointerLock();
  }

  ctx.activeMode = 'exploration';
  resetInput(ctx);
}

export function setDemoMode(world: GameWorld) {
  const { ctx } = world;
  const prev = ctx.activeMode;
  if (prev === 'demo') return;

  cleanupMode(world, prev);

  addComponent(world, ctx.playerEid, DemoModeTag);
  ctx.activeMode = 'demo';
  resetInput(ctx);
}

export function clearMode(world: GameWorld) {
  const { ctx } = world;
  cleanupMode(world, ctx.activeMode);
  ctx.activeMode = null;
}

function cleanupMode(world: GameWorld, mode: GameModeType) {
  const { ctx } = world;

  if (mode === 'driving') {
    removeComponent(world, ctx.playerEid, DrivingModeTag);
    if (ctx.activeCar.value) {
      ctx.activeCar.value.userData.isPlayerControlled = false;
      ctx.activeCar.value = null;
    }
    ctx.navArrow.visible = false;
    if (ctx.chaseArrow) ctx.chaseArrow.visible = false;
    if (ctx.checkpointMesh) ctx.checkpointMesh.visible = false;
    carAudio.stop();
  }

  if (mode === 'exploration') {
    removeComponent(world, ctx.playerEid, ExplorationModeTag);
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  if (mode === 'demo') {
    removeComponent(world, ctx.playerEid, DemoModeTag);
  }

  CarState.isPlayerControlled[ctx.playerEid] = 0;
}

function resetInput(ctx: {
  input: { forward: boolean; backward: boolean; left: boolean; right: boolean; jump: boolean };
}) {
  ctx.input.forward = false;
  ctx.input.backward = false;
  ctx.input.left = false;
  ctx.input.right = false;
  ctx.input.jump = false;
}
