import { expose } from 'comlink';
import type {
  CarState,
  ControlsData,
  GridCell,
  RemotePlayerState,
  SparkEvent,
  CrashEvent,
  RedCarState,
} from './workerTypes';
import type {
  WorkerConfig,
  UpdateResult,
  RemotePlayerUpdate,
  SimulationWorkerAPI,
} from './workerProtocol';

// HeightMap — pure math, no DOM/Three.js
class HeightMapWorker {
  private p: number[] = [];

  constructor() {
    this.init();
  }

  private init() {
    this.p = new Array(512);
    const permutation = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69,
      142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219,
      203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
      74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230,
      220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209,
      76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198,
      173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
      207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
      154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79,
      113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
      191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29,
      24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
    ];
    for (let i = 0; i < 256; i++) this.p[256 + i] = this.p[i] = permutation[i];
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number, z: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    return this.lerp(
      w,
      this.lerp(
        v,
        this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
        this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))
      ),
      this.lerp(
        v,
        this.lerp(
          u,
          this.grad(this.p[AA + 1], x, y, z - 1),
          this.grad(this.p[BA + 1], x - 1, y, z - 1)
        ),
        this.lerp(
          u,
          this.grad(this.p[AB + 1], x, y - 1, z - 1),
          this.grad(this.p[BB + 1], x - 1, y - 1, z - 1)
        )
      )
    );
  }

  getHeight(x: number, z: number): number {
    const scale = 0.0015;
    const amplitude = 50;
    let y = 0;
    y += this.noise(x * scale, z * scale, 0) * amplitude;
    y += this.noise(x * scale * 2, z * scale * 2, 0) * (amplitude * 0.5);
    y += this.noise(x * scale * 4, z * scale * 4, 0) * (amplitude * 0.25);
    return y;
  }

  getNormal(x: number, z: number): { x: number; y: number; z: number } {
    const d = 1.0;
    const hL = this.getHeight(x - d, z);
    const hR = this.getHeight(x + d, z);
    const hD = this.getHeight(x, z - d);
    const hU = this.getHeight(x, z + d);
    const dx = (hR - hL) / (2 * d);
    const dz = (hU - hD) / (2 * d);
    let nx = -dx;
    let ny = 1;
    let nz = -dz;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 0) {
      nx /= len;
      ny /= len;
      nz /= len;
    }
    return { x: nx, y: ny, z: nz };
  }
}

const heightMap = new HeightMapWorker();

function computeOrientation(
  x: number,
  z: number,
  heading: number
): {
  y: number;
  upX: number;
  upY: number;
  upZ: number;
  lookAtX: number;
  lookAtY: number;
  lookAtZ: number;
} {
  const y = heightMap.getHeight(x, z) + 1;
  const normal = heightMap.getNormal(x, z);
  const lookDist = 5;
  const tx = x + Math.sin(heading) * lookDist;
  const tz = z + Math.cos(heading) * lookDist;
  const ty = heightMap.getHeight(tx, tz) + 1;
  return {
    y,
    upX: normal.x,
    upY: normal.y,
    upZ: normal.z,
    lookAtX: tx,
    lookAtY: ty,
    lookAtZ: tz,
  };
}

// Traffic AI — runs on plain CarState[]
function updateTrafficAI(cars: CarState[]): SparkEvent[] {
  const sparks: SparkEvent[] = [];

  for (const car of cars) {
    if (car.isPlayerControlled) continue;

    if (!car.fading) {
      moveCar(car);
    } else {
      fadeCar(car);
    }
  }

  return sparks;
}

function moveCar(car: CarState) {
  if (car.isPlayerHit) return;
  if (car.turnCooldown > 0) car.turnCooldown--;

  if (car.axis === 'x') {
    car.x += car.speed * car.dir;
    handlePoliceTurning(car, car.x);
    if (car.x > config.bounds) car.x = -config.bounds;
    if (car.x < -config.bounds) car.x = config.bounds;
  } else {
    car.z += car.speed * car.dir;
    handlePoliceTurning(car, car.z);
    if (car.z > config.bounds) car.z = -config.bounds;
    if (car.z < -config.bounds) car.z = config.bounds;
  }

  const orient = computeOrientation(car.x, car.z, car.heading);
  car.y = orient.y;
  car.upX = orient.upX;
  car.upY = orient.upY;
  car.upZ = orient.upZ;
  car.lookAtX = orient.lookAtX;
  car.lookAtY = orient.lookAtY;
  car.lookAtZ = orient.lookAtZ;
}

function isAtRoadCenter(car: CarState, currentPos: number): boolean {
  const roadIndex = Math.round(
    (currentPos - (config.startOffset - config.cellSize / 2)) / config.cellSize
  );
  const roadCenter = config.startOffset + roadIndex * config.cellSize - config.cellSize / 2;
  return Math.abs(currentPos - roadCenter) < car.speed * 1.5;
}

function executePoliceTurn(car: CarState) {
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

function handlePoliceTurning(car: CarState, currentPos: number) {
  if (!car.isPolice || car.turnCooldown > 0) return;
  if (!isAtRoadCenter(car, currentPos)) return;
  if (Math.random() >= 0.4) return;
  executePoliceTurn(car);
}

function fadeCar(car: CarState) {
  if (car.axis === 'x') {
    car.x += car.speed * 0.5 * car.dir;
  } else {
    car.z += car.speed * 0.5 * car.dir;
  }

  const orient = computeOrientation(car.x, car.z, car.heading);
  car.y = orient.y;
  car.upX = orient.upX;
  car.upY = orient.upY;
  car.upZ = orient.upZ;
  car.lookAtX = orient.lookAtX;
  car.lookAtY = orient.lookAtY;
  car.lookAtZ = orient.lookAtZ;

  car.opacity -= 0.02;
  if (car.opacity <= 0) {
    resetCarState(car);
  }
}

function resetCarState(car: CarState) {
  const axis = Math.random() > 0.5 ? 'x' : 'z';
  const dir = Math.random() > 0.5 ? 1 : -1;
  const roadIndex = Math.floor(Math.random() * (config.gridSize + 1));
  const roadCoordinate = config.startOffset + roadIndex * config.cellSize - config.cellSize / 2;
  const laneOffset = (Math.random() > 0.5 ? 1 : -1) * (config.roadWidth / 4);

  let x = 0;
  let z = 0;
  if (axis === 'x') {
    z = roadCoordinate + laneOffset;
    x = (Math.random() - 0.5) * config.citySize;
  } else {
    x = roadCoordinate + laneOffset;
    z = (Math.random() - 0.5) * config.citySize;
  }

  let heading: number;
  if (axis === 'x') {
    heading = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
  } else {
    heading = dir === 1 ? 0 : Math.PI;
  }

  const orient = computeOrientation(x, z, heading);

  Object.assign(car, {
    x,
    y: orient.y,
    z,
    heading,
    speed: car.isPolice ? 2.5 + Math.random() * 1.5 : 0.5 + Math.random() * 1.0,
    dir,
    axis,
    laneOffset,
    fading: false,
    isPlayerHit: false,
    opacity: 1.0,
    turnCooldown: 0,
    upX: orient.upX,
    upY: orient.upY,
    upZ: orient.upZ,
    lookAtX: orient.lookAtX,
    lookAtY: orient.lookAtY,
    lookAtZ: orient.lookAtZ,
  });
}

// Spatial collision detection
function checkCarCollisions(cars: CarState[]): { sparks: SparkEvent[]; crashes: CrashEvent[] } {
  const sparks: SparkEvent[] = [];
  const crashes: CrashEvent[] = [];
  const gridSize = 20;
  const spatialGrid = new Map<string, CarState[]>();

  for (const car of cars) {
    if (car.fading || car.isPlayerControlled) continue;
    const key = `${Math.floor(car.x / gridSize)},${Math.floor(car.z / gridSize)}`;
    let bucket = spatialGrid.get(key);
    if (!bucket) {
      bucket = [];
      spatialGrid.set(key, bucket);
    }
    bucket.push(car);
  }

  for (const carA of cars) {
    if (carA.fading || carA.isPlayerControlled) continue;
    const gridX = Math.floor(carA.x / gridSize);
    const gridZ = Math.floor(carA.z / gridSize);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const neighbors = spatialGrid.get(`${gridX + dx},${gridZ + dz}`);
        if (!neighbors) continue;
        for (const carB of neighbors) {
          if (carA.index >= carB.index || carB.fading) continue;
          const distSq = (carA.x - carB.x) ** 2 + (carA.y - carB.y) ** 2 + (carA.z - carB.z) ** 2;
          if (distSq < 36) {
            handleCollision(carA, carB, sparks, crashes);
          }
        }
      }
    }
  }

  return { sparks, crashes };
}

function handleCollision(
  carA: CarState,
  carB: CarState,
  sparks: SparkEvent[],
  crashes: CrashEvent[]
) {
  if (carA.isPlayerControlled || carB.isPlayerControlled) {
    const player = carA.isPlayerControlled ? carA : carB;
    const ai = carA.isPlayerControlled ? carB : carA;

    player.currentSpeed *= -0.5;
    player.x += (player.x - ai.x) * 0.5;
    player.z += (player.z - ai.z) * 0.5;

    sparks.push({ x: player.x, y: player.y, z: player.z });
    crashes.push({ isPlayerInvolved: true });

    ai.fading = true;
    ai.dir *= -1;
    ai.heading += Math.random() - 0.5;
  } else {
    if (Math.random() > 0.5) return;
    carA.fading = true;
    carB.fading = true;
    carA.dir *= -1;
    carB.dir *= -1;
    carA.heading += Math.random() - 0.5;
    carB.heading += Math.random() - 0.5;
  }
}

// Red Car AI — runs on plain state
interface RedCarInternal {
  x: number;
  y: number;
  z: number;
  heading: number;
  speed: number;
  active: boolean;
}

const redCar: RedCarInternal = {
  x: 0,
  y: 0,
  z: 0,
  heading: 0,
  speed: 1.4,
  active: false,
};

function respawnRedCarState(playerX: number, playerZ: number) {
  let spawned = false;
  let attempts = 0;
  while (!spawned && attempts < 20) {
    const roadIndex = Math.floor(Math.random() * (config.gridSize + 1));
    const roadCoordinate = config.startOffset + roadIndex * config.cellSize - config.cellSize / 2;
    const otherCoord = (Math.random() - 0.5) * config.citySize;
    const axis = Math.random() > 0.5 ? 'x' : 'z';
    let x = 0;
    let z = 0;

    if (axis === 'x') {
      z = roadCoordinate;
      x = otherCoord;
      redCar.heading = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      x = roadCoordinate;
      z = otherCoord;
      redCar.heading = Math.random() > 0.5 ? 0 : Math.PI;
    }

    const dist = Math.sqrt((x - playerX) ** 2 + (z - playerZ) ** 2);
    if (dist > 500) {
      const orient = computeOrientation(x, z, redCar.heading);
      redCar.x = x;
      redCar.y = orient.y;
      redCar.z = z;
      spawned = true;
    }
    attempts++;
  }
}

function updateRedCarState(playerX: number, playerZ: number): RedCarState {
  if (!redCar.active) {
    return { ...redCar };
  }

  // Move forward
  redCar.x += Math.sin(redCar.heading) * redCar.speed;
  redCar.z += Math.cos(redCar.heading) * redCar.speed;
  const orient = computeOrientation(redCar.x, redCar.z, redCar.heading);
  redCar.y = orient.y;

  // Steer towards player
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

  // Handle intersection
  const longDist = isZAxis ? Math.abs(redCar.z - roadCenterZ) : Math.abs(redCar.x - roadCenterX);
  const latDist = isZAxis ? Math.abs(redCar.x - roadCenterX) : Math.abs(redCar.z - roadCenterZ);

  if (longDist < 5 && latDist < 25) {
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

  // Enforce bounds
  if (redCar.x > config.bounds) redCar.x = -config.bounds;
  if (redCar.x < -config.bounds) redCar.x = config.bounds;
  if (redCar.z > config.bounds) redCar.z = -config.bounds;
  if (redCar.z < -config.bounds) redCar.z = config.bounds;

  return {
    x: redCar.x,
    y: redCar.y,
    z: redCar.z,
    heading: redCar.heading,
    speed: redCar.speed,
    active: redCar.active,
  };
}

// Multiplayer — MQTT networking
let mqttClient: {
  connected: boolean;
  publish: (topic: string, message: string, options: { qos: number }) => void;
  subscribe: (topic: string) => void;
  end: (force: boolean) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
} | null = null;
const myId = Math.random().toString(36).substring(2, 10);
const topic = 'toille-vue/cyberpunk/players';
const remotePlayers = new Map<string, RemotePlayerState & { lastUpdate: number }>();
let onlineCount = 0;
let lastBroadcastTime = 0;
const broadcastInterval = 100;

function connectMQTT() {
  if (mqttClient) {
    mqttClient.end(true);
  }
  // Dynamic import for mqtt in worker context
  import('mqtt')
    .then((mqtt) => {
      const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
      mqttClient = mqtt.connect(brokerUrl) as typeof mqttClient;

      mqttClient!.on('connect', () => {
        mqttClient?.subscribe(topic);
        onlineCount = 1;
      });

      mqttClient!.on('disconnect', () => {
        onlineCount = 0;
      });

      mqttClient!.on('message', (msgTopic: unknown, message: unknown) => {
        if (typeof msgTopic === 'string' && message instanceof Buffer) {
          if (msgTopic === topic) {
            try {
              const data = JSON.parse(message.toString());
              if (data.id && data.id !== myId) {
                handleRemoteUpdate(data.id, data);
              }
            } catch {
              // ignore parsing errors
            }
          }
        }
      });
    })
    .catch(() => {
      // MQTT unavailable in worker
    });
}

function handleRemoteUpdate(
  id: string,
  data: { x: number; y: number; z: number; heading: number; state: 'walking' | 'driving' }
) {
  const now = Date.now();
  const existing = remotePlayers.get(id);
  if (!existing || existing.state !== data.state) {
    remotePlayers.set(id, {
      id,
      x: data.x,
      y: data.y,
      z: data.z,
      heading: data.heading,
      state: data.state,
      isNew: true,
      isRemoved: false,
      lastUpdate: now,
    });
  } else {
    existing.x = data.x;
    existing.y = data.y;
    existing.z = data.z;
    existing.heading = data.heading;
    existing.lastUpdate = now;
    existing.isNew = false;
  }
  onlineCount = 1 + remotePlayers.size;
}

function broadcastMQTT(
  x: number,
  y: number,
  z: number,
  heading: number,
  state: 'walking' | 'driving'
) {
  if (!mqttClient) return;
  const now = Date.now();
  if (now - lastBroadcastTime > broadcastInterval) {
    const payload = { id: myId, x, y, z, heading, state, timestamp: now };
    mqttClient.publish(topic, JSON.stringify(payload), { qos: 0 });
    lastBroadcastTime = now;
  }
}

function updateRemotePlayers(): RemotePlayerUpdate[] {
  const now = Date.now();
  const timeout = 5000;
  const updates: RemotePlayerUpdate[] = [];
  const toRemove: string[] = [];

  for (const [id, player] of remotePlayers.entries()) {
    if (now - player.lastUpdate > timeout) {
      toRemove.push(id);
      continue;
    }
    // Return target positions; main thread does visual lerp
    updates.push({
      id: player.id,
      x: player.x,
      y: player.y,
      z: player.z,
      heading: player.heading,
      state: player.state,
      isNew: player.isNew,
      isRemoved: false,
    });
  }

  for (const id of toRemove) {
    remotePlayers.delete(id);
    updates.push({
      id,
      x: 0,
      y: 0,
      z: 0,
      heading: 0,
      state: 'walking',
      isNew: false,
      isRemoved: true,
    });
  }

  onlineCount = 1 + remotePlayers.size;
  return updates;
}

function disconnectMQTT() {
  if (mqttClient) {
    mqttClient.end(true);
    mqttClient = null;
  }
  remotePlayers.clear();
  onlineCount = 0;
}

// Simulation state
let config: WorkerConfig = {
  carCount: 80,
  citySize: 2000,
  cellSize: 190,
  gridSize: 10,
  startOffset: 0,
  bounds: 1090,
  roadWidth: 40,
};
let cars: CarState[] = [];

const api: SimulationWorkerAPI = {
  init(cfg: WorkerConfig, _grids: Record<string, GridCell>, initialCars: CarState[]) {
    config = cfg;
    cars = initialCars.map((c) => ({ ...c }));
  },

  update(
    _dt: number,
    _playerX: number,
    _playerZ: number,
    _playerHeading: number,
    _playerActive: boolean,
    _controls: ControlsData
  ): UpdateResult {
    // Run traffic AI on non-player cars
    updateTrafficAI(cars);

    // Run car-car collisions
    const { sparks, crashes } = checkCarCollisions(cars);

    // Update remote player interpolation
    const remoteUpdates = updateRemotePlayers();

    // Player car physics are handled by DrivingMode on the main thread

    return {
      carStates: cars,
      remotePlayers: remoteUpdates,
      sparkEvents: sparks,
      crashEvents: crashes,
      onlineCount,
    };
  },

  broadcast(x: number, y: number, z: number, heading: number, state: 'walking' | 'driving') {
    broadcastMQTT(x, y, z, heading, state);
  },

  connect() {
    connectMQTT();
  },

  disconnect() {
    disconnectMQTT();
  },

  setPlayerCar(_index: number) {
    // Player car index tracked for future use
  },

  resetCar(index: number) {
    if (index >= 0 && index < cars.length) {
      resetCarState(cars[index]);
    }
  },

  setRedCarActive(active: boolean) {
    redCar.active = active;
  },

  updateRedCar(playerX: number, playerZ: number, _dt: number): RedCarState {
    return updateRedCarState(playerX, playerZ);
  },

  respawnRedCar(playerX: number, playerZ: number) {
    respawnRedCarState(playerX, playerZ);
  },

  dispose() {
    disconnectMQTT();
    cars = [];
    remotePlayers.clear();
  },
};

expose(api);
