import { query } from 'bitecs';
import { Position, CarState, PlayerControlled } from '../components';
import type { GameWorld } from '../world';

export function timerSystem(world: GameWorld) {
  const { ctx } = world;
  if (ctx.activeMode !== 'driving') return;
  if (ctx.isGameOver.value) return;

  const activeCar = ctx.activeCar.value;
  if (!activeCar) return;

  const eids = query(world, [Position, CarState, PlayerControlled]);
  if (eids.length === 0) return;

  ctx.timeLeft.value -= world.time.delta;
  if (ctx.timeLeft.value <= 0) {
    ctx.timeLeft.value = 0;
    ctx.isGameOver.value = true;
    ctx.navArrow.visible = false;
    return;
  }

  if (!ctx.checkpointMesh) return;

  const cx = activeCar.position.x;
  const cz = activeCar.position.z;
  const tx = ctx.checkpointMesh.position.x;
  const tz = ctx.checkpointMesh.position.z;
  const distSq = (cx - tx) ** 2 + (cz - tz) ** 2;
  ctx.distToTarget.value = Math.sqrt(distSq);

  if (distSq < 20 * 20) {
    ctx.drivingScore.value += 500;
    ctx.timeLeft.value += 15;
    ctx.playPewSound();
    ctx.spawnCheckpoint();
    ctx.reportCheckpoint();
  }

  ctx.navArrow.visible = true;
  ctx.navArrow.position.copy(activeCar.position);
  ctx.navArrow.position.y += 15;
  ctx.navArrow.lookAt(
    ctx.checkpointMesh.position.x,
    ctx.navArrow.position.y,
    ctx.checkpointMesh.position.z
  );
}
