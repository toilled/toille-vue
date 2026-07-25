import type {
  CarState,
  ControlsData,
  GridCell,
  SparkEvent,
  CrashEvent,
  RedCarState,
} from './workerTypes';

export interface WorkerConfig {
  carCount: number;
  citySize: number;
  cellSize: number;
  gridSize: number;
  startOffset: number;
  bounds: number;
  roadWidth: number;
}

export interface UpdateResult {
  carStates: CarState[];
  remotePlayers: RemotePlayerUpdate[];
  sparkEvents: SparkEvent[];
  crashEvents: CrashEvent[];
  onlineCount: number;
}

export interface RemotePlayerUpdate {
  id: string;
  x: number;
  y: number;
  z: number;
  heading: number;
  state: 'walking' | 'driving';
  isNew: boolean;
  isRemoved: boolean;
}

export interface SimulationWorkerAPI {
  init(config: WorkerConfig, occupiedGrids: Record<string, GridCell>, carStates: CarState[]): void;
  update(
    dt: number,
    playerX: number,
    playerZ: number,
    playerHeading: number,
    playerActive: boolean,
    controls: ControlsData
  ): UpdateResult;
  broadcast(x: number, y: number, z: number, heading: number, state: 'walking' | 'driving'): void;
  connect(): void;
  disconnect(): void;
  setPlayerCar(index: number): void;
  resetCar(index: number): void;
  setRedCarActive(active: boolean): void;
  updateRedCar(playerX: number, playerZ: number, dt: number): RedCarState;
  respawnRedCar(playerX: number, playerZ: number): void;
  dispose(): void;
}
