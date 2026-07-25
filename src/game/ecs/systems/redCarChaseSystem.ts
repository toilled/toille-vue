import { query } from 'bitecs';
import { Group, Vector3 } from 'three';
import { Position, Rotation, Velocity, CarState, RedCarTag } from '../components';
import { BOUNDS, CELL_SIZE, START_OFFSET } from '../../config';
import { getHeight, getNormal } from '../../../utils/HeightMap';
import { steerTowardsPlayer, handleIntersection, enforceBounds } from '../../redCarMath';
import type { GameWorld } from '../world';

export function redCarChaseSystem(world: GameWorld) {
  const { ctx } = world;
  if (ctx.activeMode !== 'driving') return;

  const playerCar = ctx.activeCar.value;
  if (!playerCar) return;

  const redCarEids = query(world, [Position, Rotation, Velocity, CarState, RedCarTag]);
  if (redCarEids.length === 0) return;

  const redEid = redCarEids[0];
  const redCarGroup = findRedCarGroup(world);
  if (!redCarGroup) return;

  const heading = CarState.heading[redEid];
  redCarGroup.position.x += Math.sin(heading) * Velocity.speed[redEid];
  redCarGroup.position.z += Math.cos(heading) * Velocity.speed[redEid];
  redCarGroup.position.y = getHeight(redCarGroup.position.x, redCarGroup.position.z) + 1;

  const normal = getNormal(redCarGroup.position.x, redCarGroup.position.z);
  redCarGroup.up.set(normal.x, normal.y, normal.z);
  const lookDist = 5;
  const tx = redCarGroup.position.x + Math.sin(heading) * lookDist;
  const tz = redCarGroup.position.z + Math.cos(heading) * lookDist;
  const ty = getHeight(tx, tz) + 1;
  redCarGroup.lookAt(tx, ty, tz);

  const redCarState = {
    x: redCarGroup.position.x,
    y: redCarGroup.position.y,
    z: redCarGroup.position.z,
    heading: CarState.heading[redEid],
    speed: Velocity.speed[redEid],
    active: true,
  };

  const road = steerTowardsPlayer(redCarState, playerCar.position.x, playerCar.position.z, {
    cellSize: CELL_SIZE,
    startOffset: START_OFFSET,
    bounds: BOUNDS,
  });

  redCarGroup.position.x = redCarState.x;
  redCarGroup.position.z = redCarState.z;

  handleIntersection(
    redCarState,
    road.roadCenterX,
    road.roadCenterZ,
    road.isZAxis,
    playerCar.position.x,
    playerCar.position.z
  );

  redCarGroup.position.x = redCarState.x;
  redCarGroup.position.z = redCarState.z;
  CarState.heading[redEid] = redCarState.heading;

  enforceBounds(redCarState, BOUNDS);
  redCarGroup.position.x = redCarState.x;
  redCarGroup.position.z = redCarState.z;

  const playerVec = new Vector3(playerCar.position.x, playerCar.position.y, playerCar.position.z);
  const dist = redCarGroup.position.distanceTo(playerVec);
  if (dist < 10) {
    ctx.isGameOver.value = true;
  }

  updateChaseArrow(redCarGroup, playerCar, world);
}

function findRedCarGroup(world: GameWorld): Group | null {
  const { ctx } = world;
  let found: Group | null = null;
  ctx.scene.traverse((child) => {
    if (child instanceof Group && child.userData?.isRedCar) {
      found = child;
    }
  });
  return found;
}

function updateChaseArrow(
  redCar: { position: { x: number; y: number; z: number } },
  playerCar: { position: { x: number; y: number; z: number } },
  world: GameWorld
) {
  const { ctx } = world;
  if (!ctx.chaseArrow) return;
  const arrow = ctx.chaseArrow;
  arrow.visible = true;
  arrow.position.set(playerCar.position.x, playerCar.position.y + 3, playerCar.position.z);
  arrow.lookAt(redCar.position.x, redCar.position.y, redCar.position.z);

  const dx = redCar.position.x - playerCar.position.x;
  const dy = redCar.position.y - playerCar.position.y;
  const dz = redCar.position.z - playerCar.position.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const op = dist < 200 ? 1 : dist > 600 ? 0 : 1 - (dist - 200) / 400;

  arrow.traverse((c) => {
    if ('material' in c && c.material) {
      (c.material as { opacity: number }).opacity = op;
    }
  });
}
