import { query } from 'bitecs';
import { Group } from 'three';
import { Position, Rotation, Velocity, CarState, PlayerControlled } from '../components';
import { carAudio } from '../../audio/CarAudio';
import { BOUNDS } from '../../config';
import { getHeight, applyCarOrientation } from '../../../utils/HeightMap';
import { checkGridCollision, resolveBuildingCollision } from '../../../utils/GridCollision';
import type { GameWorld } from '../world';

export function carPhysicsSystem(world: GameWorld) {
  const { ctx } = world;
  if (ctx.activeMode !== 'driving' || ctx.isGameOver.value) return;

  const eids = query(world, [Position, Velocity, CarState, PlayerControlled]);
  for (let i = 0; i < eids.length; i++) {
    const eid = eids[i];
    const activeCar = ctx.activeCar.value;
    if (!activeCar) continue;

    const speed = computeCarSpeed(eid, world);
    applyCarSteering(eid, speed, world);

    const heading = CarState.heading[eid] ?? activeCar.rotation.y;
    activeCar.position.x += Math.sin(heading) * speed;
    activeCar.position.z += Math.cos(heading) * speed;
    activeCar.position.y = getHeight(activeCar.position.x, activeCar.position.z) + 1;

    applyCarOrientation(activeCar, heading);

    Position.x[eid] = activeCar.position.x;
    Position.y[eid] = activeCar.position.y;
    Position.z[eid] = activeCar.position.z;
    Rotation.y[eid] = heading;

    enforceCarBounds(activeCar);
    checkBuildingCollision(activeCar, world);
  }
}

function computeCarSpeed(eid: number, world: GameWorld): number {
  const { ctx } = world;
  const activeCar = ctx.activeCar.value!;
  let speed = activeCar.userData.currentSpeed || 0;
  const maxSpeed = CarState.maxSpeed[eid] || 2;
  const acceleration = 0.1;
  const braking = 0.05;
  const friction = 0.99;

  if (ctx.input.forward) {
    speed += speed < 0 ? braking : acceleration;
  } else if (ctx.input.backward) {
    speed -= speed > 0 ? braking : acceleration;
  }

  speed *= friction;
  if (speed > maxSpeed) speed = maxSpeed;
  if (speed < -maxSpeed / 2) speed = -maxSpeed / 2;

  activeCar.userData.currentSpeed = speed;
  carAudio.update(speed);
  return speed;
}

function applyCarSteering(eid: number, speed: number, world: GameWorld) {
  if (Math.abs(speed) <= 0.1) return;
  const { ctx } = world;
  const dir = speed > 0 ? 1 : -1;
  const turnSpeed = 0.04 / (Math.sqrt(Math.abs(speed)) + 1);
  if (ctx.input.left) CarState.heading[eid] += turnSpeed * dir;
  if (ctx.input.right) CarState.heading[eid] -= turnSpeed * dir;
}

function enforceCarBounds(car: Group) {
  if (car.position.x > BOUNDS) car.position.x = -BOUNDS;
  if (car.position.x < -BOUNDS) car.position.x = BOUNDS;
  if (car.position.z > BOUNDS) car.position.z = -BOUNDS;
  if (car.position.z < -BOUNDS) car.position.z = BOUNDS;
}

function checkBuildingCollision(car: Group, world: GameWorld) {
  const { ctx } = world;
  if (!checkGridCollision(car.position.x, car.position.z, ctx.occupiedGrids, 5)) return;

  const result = resolveBuildingCollision(car.position.x, car.position.z, ctx.occupiedGrids, 5);
  if (result.hit) {
    car.userData.currentSpeed *= -0.5;
    carAudio.playCrash();
    car.position.x += result.bounceX;
    car.position.z += result.bounceZ;
    ctx.spawnSparks(car.position);
  }
}
