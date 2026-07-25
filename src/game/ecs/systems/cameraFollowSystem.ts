import { query } from 'bitecs';
import { Position, CarState, PlayerControlled } from '../components';
import type { GameWorld } from '../world';

export function cameraFollowSystem(world: GameWorld) {
  const { ctx } = world;
  if (ctx.activeMode !== 'driving') return;

  const activeCar = ctx.activeCar.value;
  if (!activeCar) return;

  const eids = query(world, [Position, CarState, PlayerControlled]);
  if (eids.length === 0) return;

  const eid = eids[0];
  const heading = CarState.heading[eid];
  followCarCamera(activeCar, heading, ctx);
}

function followCarCamera(
  car: { position: { x: number; y: number; z: number } },
  heading: number,
  ctx: {
    camera: {
      position: { x: number; y: number; z: number };
      lookAt: (x: number, y: number, z: number) => void;
    };
  }
) {
  const { camera } = ctx;
  const dist = 40;
  const height = 20;
  const targetX = car.position.x - Math.sin(heading) * dist;
  const targetZ = car.position.z - Math.cos(heading) * dist;
  const targetY = car.position.y + height;
  camera.position.x += (targetX - camera.position.x) * 0.1;
  camera.position.z += (targetZ - camera.position.z) * 0.1;
  camera.position.y += (targetY - camera.position.y) * 0.1;
  camera.lookAt(car.position.x, car.position.y, car.position.z);
}
