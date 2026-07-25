import * as Comlink from 'comlink';
import type {
  SimulationWorkerAPI,
  WorkerConfig,
  UpdateResult,
  RemotePlayerUpdate,
} from './workers/workerProtocol';
import type {
  CarState,
  GridCell,
  ControlsData,
  SparkEvent,
  CrashEvent,
} from './workers/workerTypes';
import { Group, Scene, Vector3 } from 'three';
import { CarFactory } from './CarFactory';
import { disposeGroup } from './disposeGroup';
import { createWalkingPlayer } from './createWalkingPlayer';
import { applyFadingOpacity } from './applyFadingOpacity';
import { type Ref } from 'vue';

export interface SimulationUpdateResult {
  remotePlayers: RemotePlayerUpdate[];
  sparkEvents: SparkEvent[];
  crashEvents: CrashEvent[];
  onlineCount: number;
}

export class SimulationBridge {
  private worker: Comlink.Remote<SimulationWorkerAPI> | null = null;
  private cars: Group[] = [];
  private carStates: CarState[] = [];
  private remotePlayerMeshes = new Map<string, Group>();
  private scene: Scene;
  private carFactory: CarFactory;
  private onlineCountRef: Ref<number>;
  private disposed = false;
  private pendingUpdate: Promise<UpdateResult> | null = null;

  constructor(scene: Scene, carFactory: CarFactory, onlineCountRef: Ref<number>) {
    this.scene = scene;
    this.carFactory = carFactory;
    this.onlineCountRef = onlineCountRef;

    // Worker may not be available in test/SSR environments
    if (typeof Worker !== 'undefined') {
      try {
        const workerUrl = new URL('./workers/simulation.worker.ts', import.meta.url);
        const worker = new Worker(workerUrl, { type: 'module' });
        this.worker = Comlink.wrap<SimulationWorkerAPI>(worker);
      } catch {
        // Worker initialization failed
      }
    }
  }

  async init(
    cfg: WorkerConfig,
    occupiedGrids: Record<string, GridCell>,
    cars: Group[]
  ): Promise<void> {
    this.cars = cars;
    this.carStates = cars.map((car, i) => this.extractCarState(car, i));
    if (this.worker) {
      await this.worker.init(cfg, occupiedGrids, this.carStates);
    }
  }

  async connect(): Promise<void> {
    if (this.worker) {
      await this.worker.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.worker) {
      await this.worker.disconnect();
    }
  }

  async broadcast(
    x: number,
    y: number,
    z: number,
    heading: number,
    state: 'walking' | 'driving'
  ): Promise<void> {
    if (this.worker) {
      await this.worker.broadcast(x, y, z, heading, state);
    }
  }

  startUpdate(dt: number, activeCar: Group | null, controls: ControlsData): void {
    if (this.disposed || !this.worker) return;

    // Extract player position from active car
    let playerX = 0;
    let playerZ = 0;
    let playerHeading = 0;
    const playerActive = !!activeCar;

    if (activeCar) {
      playerX = activeCar.position.x;
      playerZ = activeCar.position.z;
      playerHeading = activeCar.userData.heading ?? activeCar.rotation.y;
    }

    // Fire-and-forget: start async update, consume result next frame
    this.pendingUpdate = this.worker.update(
      dt,
      playerX,
      playerZ,
      playerHeading,
      playerActive,
      controls
    );
  }

  async consumeUpdate(): Promise<SimulationUpdateResult | null> {
    if (!this.pendingUpdate) return null;

    try {
      const result = await this.pendingUpdate;
      this.pendingUpdate = null;

      // Apply car states to Three.js objects (non-player cars only)
      this.applyCarStates(result.carStates);

      // Handle remote players
      this.updateRemotePlayerMeshes(result.remotePlayers);

      // Update online count
      this.onlineCountRef.value = result.onlineCount;

      return {
        remotePlayers: result.remotePlayers,
        sparkEvents: result.sparkEvents,
        crashEvents: result.crashEvents,
        onlineCount: result.onlineCount,
      };
    } catch {
      this.pendingUpdate = null;
      return null;
    }
  }

  private applyCarStates(states: CarState[]): void {
    for (const state of states) {
      const car = this.cars[state.index];
      if (!car) continue;

      // Don't override active car position (it's driven by DrivingMode)
      if (car.userData.isPlayerControlled) continue;

      car.position.x = state.x;
      car.position.y = state.y;
      car.position.z = state.z;

      // Apply orientation via lookAt
      car.up.set(state.upX, state.upY, state.upZ);
      car.lookAt(state.lookAtX, state.lookAtY, state.lookAtZ);

      car.userData.heading = state.heading;
      car.userData.fading = state.fading;
      car.userData.opacity = state.opacity;
      car.userData.turnCooldown = state.turnCooldown;
      car.userData.isPlayerHit = state.isPlayerHit;

      // Handle fading opacity on materials
      if (state.fading) {
        applyFadingOpacity(car, state.opacity);
      }
    }
  }

  private extractCarState(car: Group, index: number): CarState {
    return {
      index,
      x: car.position.x,
      y: car.position.y,
      z: car.position.z,
      heading: car.userData.heading ?? car.rotation.y,
      speed: car.userData.speed ?? 0,
      dir: car.userData.dir ?? 1,
      axis: car.userData.axis ?? 'x',
      fading: car.userData.fading ?? false,
      opacity: car.userData.opacity ?? 1,
      turnCooldown: car.userData.turnCooldown ?? 0,
      isPlayerControlled: car.userData.isPlayerControlled ?? false,
      isPolice: car.userData.isPolice ?? false,
      isPlayerHit: car.userData.isPlayerHit ?? false,
      isTruck: car.userData.isTruck ?? false,
      bodyColor:
        typeof car.userData.bodyColor === 'object' && car.userData.bodyColor?.getHex
          ? car.userData.bodyColor.getHex()
          : (car.userData.bodyColor ?? 0x222222),
      currentSpeed: car.userData.currentSpeed ?? 0,
      laneOffset: car.userData.laneOffset ?? 0,
      upX: car.up.x,
      upY: car.up.y,
      upZ: car.up.z,
      lookAtX: car.position.x,
      lookAtY: car.position.y,
      lookAtZ: car.position.z,
    };
  }

  private updateRemotePlayerMeshes(updates: RemotePlayerUpdate[]): void {
    for (const update of updates) {
      if (update.isRemoved) {
        const existing = this.remotePlayerMeshes.get(update.id);
        if (existing) {
          this.scene.remove(existing);
          disposeGroup(existing);
          this.remotePlayerMeshes.delete(update.id);
        }
        continue;
      }

      let group = this.remotePlayerMeshes.get(update.id);

      if (update.isNew || !group) {
        if (group) {
          this.scene.remove(group);
        }

        if (update.state === 'driving') {
          group = this.carFactory.createCar(false);
        } else {
          group = createWalkingPlayer();
        }

        group.position.set(update.x, update.y, update.z);
        group.rotation.y = update.heading;
        this.scene.add(group);
        this.remotePlayerMeshes.set(update.id, group);
      } else {
        // Interpolate position
        group.position.lerp(new Vector3(update.x, update.y, update.z), 0.2);

        // Interpolate rotation
        const currentH = group.rotation.y;
        let diff = update.heading - currentH;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        group.rotation.y += diff * 0.2;
      }
    }
  }

  async dispose(): Promise<void> {
    this.disposed = true;
    this.pendingUpdate = null;

    // Remove remote player meshes
    for (const [, mesh] of this.remotePlayerMeshes) {
      this.scene.remove(mesh);
      disposeGroup(mesh);
    }
    this.remotePlayerMeshes.clear();

    if (this.worker) {
      await this.worker.dispose();
    }
  }
}
