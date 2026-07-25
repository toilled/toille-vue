import type { RedCarState } from './workers/workerTypes';
export type { RedCarState } from './workers/workerTypes';

export interface RedCarConfig {
  cellSize: number;
  startOffset: number;
  bounds: number;
}

export function steerTowardsPlayer(
  redCar: RedCarState,
  playerX: number,
  playerZ: number,
  config: RedCarConfig
): { roadCenterX: number; roadCenterZ: number; isZAxis: boolean } {
  const heading = redCar.heading;
  const isZAxis = Math.abs(Math.cos(heading)) > 0.5;

  const roadHalf = config.cellSize / 2;
  const gridX = Math.round((redCar.x - config.startOffset - roadHalf) / config.cellSize);
  const gridZ = Math.round((redCar.z - config.startOffset - roadHalf) / config.cellSize);
  const roadCenterX = config.startOffset + gridX * config.cellSize + roadHalf;
  const roadCenterZ = config.startOffset + gridZ * config.cellSize + roadHalf;

  const lateralSpeed = redCar.speed * 0.3;
  const maxOffset = 18;

  if (isZAxis) {
    const targetX = Math.max(roadCenterX - maxOffset, Math.min(roadCenterX + maxOffset, playerX));
    const diff = targetX - redCar.x;
    if (Math.abs(diff) > 0.1) {
      redCar.x += Math.sign(diff) * Math.min(Math.abs(diff), lateralSpeed);
    }
  } else {
    const targetZ = Math.max(roadCenterZ - maxOffset, Math.min(roadCenterZ + maxOffset, playerZ));
    const diff = targetZ - redCar.z;
    if (Math.abs(diff) > 0.1) {
      redCar.z += Math.sign(diff) * Math.min(Math.abs(diff), lateralSpeed);
    }
  }

  return { roadCenterX, roadCenterZ, isZAxis };
}

export function handleIntersection(
  redCar: RedCarState,
  roadCenterX: number,
  roadCenterZ: number,
  isZAxis: boolean,
  playerX: number,
  playerZ: number
): void {
  const longDist = isZAxis ? Math.abs(redCar.z - roadCenterZ) : Math.abs(redCar.x - roadCenterX);
  const latDist = isZAxis ? Math.abs(redCar.x - roadCenterX) : Math.abs(redCar.z - roadCenterZ);

  if (longDist >= 5 || latDist >= 25) return;

  const directions = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  let bestDir = redCar.heading;
  let minDst = Infinity;
  const curDirX = Math.sin(bestDir);
  const curDirZ = Math.cos(bestDir);

  for (const dir of directions) {
    const dx = Math.sin(dir);
    const dz = Math.cos(dir);
    if (dx * curDirX + dz * curDirZ < -0.9) continue;
    const d = (redCar.x + dx * 100 - playerX) ** 2 + (redCar.z + dz * 100 - playerZ) ** 2;
    if (d < minDst) {
      minDst = d;
      bestDir = dir;
    }
  }

  redCar.heading = bestDir;
  redCar.x += Math.sin(bestDir) * 6;
  redCar.z += Math.cos(bestDir) * 6;
}

export function enforceBounds(redCar: RedCarState, bounds: number): void {
  if (redCar.x > bounds) redCar.x = -bounds;
  if (redCar.x < -bounds) redCar.x = bounds;
  if (redCar.z > bounds) redCar.z = -bounds;
  if (redCar.z < -bounds) redCar.z = bounds;
}
