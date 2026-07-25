export interface TrafficCarState {
  axis: 'x' | 'z';
  dir: number;
  speed: number;
  x: number;
  z: number;
  heading: number;
  turnCooldown: number;
  isPolice: boolean;
  isPlayerHit: boolean;
}

export interface TrafficConfig {
  cellSize: number;
  startOffset: number;
  roadWidth: number;
  bounds: number;
}

export function isAtRoadCenter(
  car: TrafficCarState,
  currentPos: number,
  config: TrafficConfig
): boolean {
  const roadIndex = Math.round(
    (currentPos - (config.startOffset - config.cellSize / 2)) / config.cellSize
  );
  const roadCenter = config.startOffset + roadIndex * config.cellSize - config.cellSize / 2;
  return Math.abs(currentPos - roadCenter) < car.speed * 1.5;
}

export function executePoliceTurn(car: TrafficCarState, config: TrafficConfig): void {
  const newDir = Math.random() > 0.5 ? 1 : -1;
  const laneOffset = (Math.random() > 0.5 ? 1 : -1) * (config.roadWidth / 4);

  if (car.axis === 'x') {
    car.x =
      Math.round((car.x - (config.startOffset - config.cellSize / 2)) / config.cellSize) *
        config.cellSize +
      (config.startOffset - config.cellSize / 2) +
      laneOffset;
    car.axis = 'z';
    car.heading = newDir === 1 ? 0 : Math.PI;
  } else {
    car.z =
      Math.round((car.z - (config.startOffset - config.cellSize / 2)) / config.cellSize) *
        config.cellSize +
      (config.startOffset - config.cellSize / 2) +
      laneOffset;
    car.axis = 'x';
    car.heading = newDir === 1 ? Math.PI / 2 : -Math.PI / 2;
  }
  car.dir = newDir;
  car.turnCooldown = 60;
}

function handlePoliceTurning(
  car: TrafficCarState,
  currentPos: number,
  config: TrafficConfig
): void {
  if (!car.isPolice || car.turnCooldown > 0) return;
  if (!isAtRoadCenter(car, currentPos, config)) return;
  if (Math.random() >= 0.4) return;
  executePoliceTurn(car, config);
}

export function moveTrafficCar(car: TrafficCarState, config: TrafficConfig): void {
  if (car.isPlayerHit) return;
  if (car.turnCooldown > 0) car.turnCooldown--;

  if (car.axis === 'x') {
    car.x += car.speed * car.dir;
    handlePoliceTurning(car, car.x, config);
    if (car.x > config.bounds) car.x = -config.bounds;
    if (car.x < -config.bounds) car.x = config.bounds;
  } else {
    car.z += car.speed * car.dir;
    handlePoliceTurning(car, car.z, config);
    if (car.z > config.bounds) car.z = -config.bounds;
    if (car.z < -config.bounds) car.z = config.bounds;
  }
}
