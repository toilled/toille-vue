import { Group, Scene } from 'three';
import { CarFactory } from './CarFactory';
import { TrafficSpawner } from './TrafficSpawner';
import { TrafficAI } from './TrafficAI';
import { carAudio } from './audio/CarAudio';

export class TrafficSystem {
  private cars: Group[] = [];
  private spawner: TrafficSpawner;
  private initialized = false;

  constructor(
    scene: Scene,
    carCount: number,
    spawnSparks: (pos: { x: number; y: number; z: number }) => void
  ) {
    const carFactory = new CarFactory();
    this.spawner = new TrafficSpawner(scene, carFactory, this.cars, carCount, spawnSparks);
  }

  public init() {
    if (this.initialized) return;
    this.initialized = true;
    this.spawner.initCars();
    this.spawner.createInstanceMeshes();
  }

  public getCars(): Group[] {
    return this.cars;
  }

  public getCarFactory(): CarFactory {
    return this.spawner.getCarFactory();
  }

  public update(activeCar?: Group | null) {
    if (!this.initialized) return;
    TrafficAI.updateCars(this.cars, (car) => this.spawner.resetCar(car));
    this.checkCollisions();
    this.spawner.syncCarInstances(activeCar || null);
  }

  // fallow-ignore-next-line unused-class-member
  public resetCar(carGroup: Group, activeCar?: Group | null) {
    this.spawner.resetCar(carGroup, activeCar);
  }

  public addLightsToCar(car: Group) {
    this.spawner.addLightsToCar(car);
  }

  public removeLightsFromCar(car: Group) {
    this.spawner.removeLightsFromCar(car);
  }

  private spatialGrid = new Map<string, Group[]>();
  private spatialGridPool: Group[][] = [];
  private spatialGridSize = 20;

  private buildSpatialGrid(): Map<string, Group[]> {
    const grid = this.spatialGrid;
    for (const [, bucket] of grid) {
      bucket.length = 0;
      this.spatialGridPool.push(bucket);
    }
    grid.clear();

    for (const car of this.cars) {
      if (car.userData.fading) continue;
      const key = `${Math.floor(car.position.x / this.spatialGridSize)},${Math.floor(car.position.z / this.spatialGridSize)}`;
      let bucket = grid.get(key);
      if (!bucket) {
        bucket = this.spatialGridPool.pop() ?? [];
        grid.set(key, bucket);
      }
      bucket.push(car);
    }

    return grid;
  }

  private checkCollisions() {
    const actualCollisionDist = 6;
    const distSqThreshold = actualCollisionDist * actualCollisionDist;
    const gridSize = 20;
    const grid = this.buildSpatialGrid();

    for (const carA of this.cars) {
      if (carA.userData.fading) continue;

      const gridX = Math.floor(carA.position.x / gridSize);
      const gridZ = Math.floor(carA.position.z / gridSize);
      this.checkNeighborCells(carA, grid, gridX, gridZ, distSqThreshold);
    }
  }

  private checkCarPairCollision(carA: Group, carB: Group, distSqThreshold: number) {
    if (carA.uuid >= carB.uuid || carB.userData.fading) return;
    if (carA.position.distanceToSquared(carB.position) < distSqThreshold) {
      this.handleCollision(carA, carB);
    }
  }

  private checkNeighborCells(
    carA: Group,
    grid: Map<string, Group[]>,
    gridX: number,
    gridZ: number,
    distSqThreshold: number
  ) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const neighbors = grid.get(`${gridX + dx},${gridZ + dz}`);
        if (neighbors) {
          for (const carB of neighbors) {
            this.checkCarPairCollision(carA, carB, distSqThreshold);
          }
        }
      }
    }
  }

  private handleCollision(carA: Group, carB: Group) {
    if (carA.userData.isPlayerControlled || carB.userData.isPlayerControlled) {
      const player = carA.userData.isPlayerControlled ? carA : carB;
      const ai = carA.userData.isPlayerControlled ? carB : carA;

      player.userData.currentSpeed *= -0.5;
      carAudio.playCrash();
      player.position.x += (player.position.x - ai.position.x) * 0.5;
      player.position.z += (player.position.z - ai.position.z) * 0.5;

      ai.userData.fading = true;
      ai.userData.dir *= -1;
      ai.userData.heading += Math.random() - 0.5;
      this.spawner.spawnSparks(player.position);
    } else {
      if (Math.random() > 0.5) return;

      carA.userData.fading = true;
      carB.userData.fading = true;

      carA.userData.dir *= -1;
      carB.userData.dir *= -1;

      carA.userData.heading += Math.random() - 0.5;
      carB.userData.heading += Math.random() - 0.5;
    }
  }
}
