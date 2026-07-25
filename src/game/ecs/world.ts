import { createWorld, addEntity, addComponent } from 'bitecs';
import {
  Position,
  Rotation,
  Velocity,
  CarState,
  PlayerControlled,
  RedCarTag,
  SceneRef,
  type GameWorldContext,
} from './components';

export type GameWorld = ReturnType<typeof createGameWorld>;

export function createGameWorld(ctx: GameWorldContext) {
  const world = createWorld({
    time: { delta: 0, elapsed: 0, then: performance.now() },
    ctx,
  });

  // Create player car entity
  const playerEid = addEntity(world);
  addComponent(world, playerEid, Position);
  addComponent(world, playerEid, Rotation);
  addComponent(world, playerEid, Velocity);
  addComponent(world, playerEid, CarState);
  addComponent(world, playerEid, PlayerControlled);
  SceneRef[playerEid] = {};

  // Create red car entity
  const redCarEid = addEntity(world);
  addComponent(world, redCarEid, Position);
  addComponent(world, redCarEid, Rotation);
  addComponent(world, redCarEid, Velocity);
  addComponent(world, redCarEid, CarState);
  addComponent(world, redCarEid, RedCarTag);
  SceneRef[redCarEid] = {};

  ctx.playerEid = playerEid;
  ctx.redCarEid = redCarEid;

  return world;
}
