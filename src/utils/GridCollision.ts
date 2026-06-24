import { CELL_SIZE, START_OFFSET } from '../game/config';

export type OccupiedGrid = Map<string, { halfW: number; halfD: number; isRound?: boolean }>;

function getGridCell(x: number, z: number): { ix: number; iz: number } {
  return {
    ix: Math.round((x - START_OFFSET) / CELL_SIZE),
    iz: Math.round((z - START_OFFSET) / CELL_SIZE),
  };
}

function getGridCenter(ix: number, iz: number): { cx: number; cz: number } {
  return {
    cx: START_OFFSET + ix * CELL_SIZE,
    cz: START_OFFSET + iz * CELL_SIZE,
  };
}

export function checkGridCollision(
  x: number,
  z: number,
  occupiedGrids: OccupiedGrid,
  margin = 2
): boolean {
  const { ix, iz } = getGridCell(x, z);
  const key = `${ix},${iz}`;
  if (!occupiedGrids.has(key)) return false;
  const { cx, cz } = getGridCenter(ix, iz);
  const dims = occupiedGrids.get(key);
  if (!dims) return false;
  return Math.abs(x - cx) < dims.halfW + margin && Math.abs(z - cz) < dims.halfD + margin;
}

export interface CollisionResult {
  hit: boolean;
  bounceX: number;
  bounceZ: number;
}

export function resolveBuildingCollision(
  x: number,
  z: number,
  occupiedGrids: OccupiedGrid,
  margin = 5
): CollisionResult {
  const { ix, iz } = getGridCell(x, z);
  const key = `${ix},${iz}`;
  if (!occupiedGrids.has(key)) return { hit: false, bounceX: 0, bounceZ: 0 };

  const { cx, cz } = getGridCenter(ix, iz);
  const dims = occupiedGrids.get(key)!;

  if (dims.isRound) {
    const radius = Math.max(dims.halfW, dims.halfD);
    const dx = x - cx;
    const dz = z - cz;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < radius + margin) {
      let nx = 0;
      let nz = 1;
      if (dist > 0.001) {
        nx = dx / dist;
        nz = dz / dist;
      }
      return {
        hit: true,
        bounceX: nx * (radius + margin - dist + 2),
        bounceZ: nz * (radius + margin - dist + 2),
      };
    }
    return { hit: false, bounceX: 0, bounceZ: 0 };
  }

  if (Math.abs(x - cx) < dims.halfW + margin && Math.abs(z - cz) < dims.halfD + margin) {
    return {
      hit: true,
      bounceX: Math.sign(x - cx) * 2,
      bounceZ: Math.sign(z - cz) * 2,
    };
  }

  return { hit: false, bounceX: 0, bounceZ: 0 };
}
