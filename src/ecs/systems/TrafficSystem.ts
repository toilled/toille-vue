import { System } from '../types';
import { ECSWorld } from '../types';
import { Scene, Group } from 'three';
import { CarFactory } from '../../game/CarFactory';
import { TrafficSpawner } from '../../game/TrafficSpawner';
import { TrafficAI } from '../../game/TrafficAI';
import { carAudio } from '../../game/audio/CarAudio';

export class TrafficSystem extends System {
  private cars: Group[] = [];
  private spawner: TrafficSpawner;
  private initialized = false;

  constructor(
    scene: Scene,
    carCount: number,
    spawnSparks: (pos: { x: number; y: number; z: number }) => void
  ) {
    super();
    const carFactory = new CarFactory();
    this.spawner = new TrafficSpawner(scene, carFactory, this.cars, carCount, spawnSparks);
  }

  init(world: ECSWorld) {
    if (this.initialized) return;
    this.initialized = true;
    this.spawner.initCars();
    this.spawner.createInstanceMeshes();
    world.resources.cars = this.cars;
  }

  update(world: ECSWorld, _dt: number, _time: number): void {
    if (!this.initialized) return;

    const activeCar = world.resources.activeCar?.value || null;
    TrafficAI.updateCars(this.cars, (car) => this.spawner.resetCar(car));
    this.checkCollisions(world);
    this.spawner.syncCarInstances(activeCar);
  }

  private checkCollisions(world: ECSWorld) {
    const actualCollisionDist = 6;
    const distSqThreshold = actualCollisionDist * actualCollisionDist;
    const gridSize = 20;

    const grid = this.buildSpatialGrid();

    for (const carA of this.cars) {
      if (carA.userData.fading) continue;

      const gridX = Math.floor(carA.position.x / gridSize);
      const gridZ = Math.floor(carA.position.z / gridSize);
      this.checkNeighborCells(carA, grid, gridX, gridZ, distSqThreshold, world);
    }
  }

  private buildSpatialGrid(): Map<string, Group[]> {
    const grid = new Map<string, Group[]>();

    for (const car of this.cars) {
      if (car.userData.fading) continue;
      const key = `${Math.floor(car.position.x / 20)},${Math.floor(car.position.z / 20)}`;
      let bucket = grid.get(key);
      if (!bucket) {
        bucket = [];
        grid.set(key, bucket);
      }
      bucket.push(car);
    }

    return grid;
  }

  private checkCarPairCollision(
    carA: Group,
    carB: Group,
    distSqThreshold: number,
    world: ECSWorld
  ) {
    if (carA.uuid >= carB.uuid || carB.userData.fading) return;
    if (carA.position.distanceToSquared(carB.position) < distSqThreshold) {
      this.handleCollision(carA, carB, world);
    }
  }

  private checkNeighborCells(
    carA: Group,
    grid: Map<string, Group[]>,
    gridX: number,
    gridZ: number,
    distSqThreshold: number,
    world: ECSWorld
  ) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const neighbors = grid.get(`${gridX + dx},${gridZ + dz}`);
        if (neighbors) {
          for (const carB of neighbors) {
            this.checkCarPairCollision(carA, carB, distSqThreshold, world);
          }
        }
      }
    }
  }

  private handleCollision(carA: Group, carB: Group, _world: ECSWorld) {
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

  getCars(): Group[] {
    return this.cars;
  }

  getCarFactory(): CarFactory {
    return this.spawner.getCarFactory();
  }

  resetCar(carGroup: Group, activeCar?: Group | null) {
    this.spawner.resetCar(carGroup, activeCar);
  }

  addLightsToCar(car: Group) {
    this.spawner.addLightsToCar(car);
  }

  removeLightsFromCar(car: Group) {
    this.spawner.removeLightsFromCar(car);
  }
}
