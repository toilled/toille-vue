import { Group, Mesh, MeshBasicMaterial, PointLight, Scene, Object3D, SpotLight } from "three";
import {
  BOUNDS,
  CELL_SIZE,
  CITY_SIZE,
  GRID_SIZE,
  ROAD_WIDTH,
  START_OFFSET,
} from "./config";
import { carAudio } from "./audio/CarAudio";
import { getHeight, getNormal } from "../utils/HeightMap";
import { CarFactory } from "./CarFactory";

export class TrafficSystem {
  private scene: Scene;
  private cars: Group[] = [];
  private carCount: number;
  private occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>;
  private spawnSparks: (pos: any) => void;
  private carFactory: CarFactory;

  constructor(
    scene: Scene,
    carCount: number,
    occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>,
    spawnSparks: (pos: any) => void
  ) {
    this.scene = scene;
    this.carCount = carCount;
    this.occupiedGrids = occupiedGrids;
    this.spawnSparks = spawnSparks;
    this.carFactory = new CarFactory();
    this.initCars();
  }

  public getCars(): Group[] {
    return this.cars;
  }

  private initCars() {
    const policeCount = 3;
    const totalCars = this.carCount + policeCount;

    for (let i = 0; i < totalCars; i++) {
      const isPolice = i >= this.carCount;
      const carGroup = this.carFactory.createCar(isPolice);

      this.resetCar(carGroup);
      this.scene.add(carGroup);
      this.cars.push(carGroup);
    }
  }

  public addLightsToCar(car: Group) {
    const hlColor = 0xffffaa;
    const hlIntensity = 800;
    const hlDist = 800;
    const hlAngle = Math.PI / 4.5;
    const hlPenumbra = 0.2;

    const isTruck = !!car.userData.isTruck;

    const yPos = isTruck ? 4 : 2;
    const zFront = isTruck ? 8 : 4;
    const zBack = isTruck ? -10 : -4;
    const xOffset = isTruck ? 2 : 1.5;

    this.createSpotLight(car, xOffset, yPos, zFront, hlColor, hlIntensity, hlDist, hlAngle, hlPenumbra, 36);
    this.createSpotLight(car, -xOffset, yPos, zFront, hlColor, hlIntensity, hlDist, hlAngle, hlPenumbra, 36);

    const tlColor = 0xff0000;
    const tlIntensity = 50;
    const tlDist = 50;
    const tlAngle = Math.PI / 2.5;

    this.createSpotLight(car, xOffset, yPos, zBack, tlColor, tlIntensity, tlDist, tlAngle, 0.5, -16);
    this.createSpotLight(car, -xOffset, yPos, zBack, tlColor, tlIntensity, tlDist, tlAngle, 0.5, -16);
  }

  private createSpotLight(car: Group, x: number, y: number, z: number, color: number, intensity: number, distance: number, angle: number, penumbra: number, targetZOffset: number) {
      const light = new SpotLight(color, intensity, distance, angle, penumbra, 1);
      light.position.set(x, y, z);
      light.castShadow = false;
      light.userData.isCarLight = true;

      const target = new Object3D();
      target.position.set(x, -10, z + targetZOffset);
      car.add(target);
      light.target = target;
      car.add(light);
  }

  public removeLightsFromCar(car: Group) {
    const lightsToRemove: Object3D[] = [];
    const targetsToRemove: Object3D[] = [];

    car.traverse((child) => {
      if (child.userData.isCarLight) {
        lightsToRemove.push(child);
        if (child instanceof SpotLight) {
          targetsToRemove.push(child.target);
        }
      }
    });

    lightsToRemove.forEach((l) => {
      car.remove(l);
      if (l instanceof SpotLight) {
        l.dispose();
      }
    });

    targetsToRemove.forEach((t) => car.remove(t));
  }

  public resetCar(carGroup: Group, activeCar?: Group | null) {
    const wasActive = activeCar && carGroup.uuid === activeCar.uuid;
    const isPolice = !!carGroup.userData.isPolice;

    this.removeLightsFromCar(carGroup);

    const axis = Math.random() > 0.5 ? "x" : "z";
    const dir = Math.random() > 0.5 ? 1 : -1;

    const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
    const roadCoordinate = START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;
    const laneOffset = (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

    let x = 0, z = 0;
    if (axis === "x") {
      z = roadCoordinate + laneOffset;
      x = (Math.random() - 0.5) * CITY_SIZE;
      carGroup.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      x = roadCoordinate + laneOffset;
      z = (Math.random() - 0.5) * CITY_SIZE;
      carGroup.rotation.y = dir === 1 ? 0 : Math.PI;
    }

    carGroup.userData.heading = carGroup.rotation.y;
    carGroup.position.set(x, getHeight(x, z) + 1, z);

    // Reset properties
    Object.assign(carGroup.userData, {
        speed: isPolice ? 2.5 + Math.random() * 1.5 : 0.5 + Math.random() * 1.0,
        dir,
        axis,
        laneOffset,
        collided: false,
        fading: false,
        isPlayerHit: false,
        opacity: 1.0,
        isPlayerControlled: false,
        currentSpeed: 0,
        isPolice,
        turnCooldown: 0
    });

    carGroup.visible = true;
    this.restoreOpacity(carGroup);

    if (wasActive) {
      this.addLightsToCar(carGroup);
    }
  }

  private restoreOpacity(carGroup: Group) {
      carGroup.traverse((child) => {
          if (child instanceof Mesh) {
            const mat = child.material;
            if (!Array.isArray(mat) && child.userData.originalOpacity !== undefined) {
              mat.opacity = child.userData.originalOpacity;
            }
          }
      });
  }

  public update() {
    this.updateCars();
    this.checkCollisions();
  }

  private updateCars() {
      const time = Date.now();
      const isRedOn = Math.floor(time / 150) % 2 === 0;

      for (const car of this.cars) {
          if (car.userData.isPolice) {
              this.updatePoliceLights(car, isRedOn);
          }

          if (car.userData.isPlayerControlled) continue;

          if (!car.userData.fading) {
              this.moveCar(car);
          } else {
              this.fadeCar(car);
          }
      }
  }

  private updatePoliceLights(car: Group, isRedOn: boolean) {
      car.traverse((child) => {
          if (child.userData.isPoliceFlasher) {
            const light = child as PointLight;
            const isRed = light.color.getHex() === 0xff0000;
            light.visible = isRed ? isRedOn : !isRedOn;
          }
          if (child.userData.isPoliceFlasherMesh) {
            const mesh = child as Mesh;
            const mat = mesh.material as MeshBasicMaterial;
            const isRed = mat.color.getHex() === 0xff0000;
            mesh.visible = isRed ? isRedOn : !isRedOn;
          }
      });
  }

  private moveCar(car: Group) {
      if (car.userData.isPlayerHit) return;

      if (car.userData.turnCooldown > 0) {
        car.userData.turnCooldown--;
      }

      const speed = car.userData.speed;
      const dir = car.userData.dir;

      if (car.userData.axis === "x") {
          car.position.x += speed * dir;
          this.handlePoliceTurning(car, car.position.x);

          if (car.position.x > BOUNDS) car.position.x = -BOUNDS;
          if (car.position.x < -BOUNDS) car.position.x = BOUNDS;
      } else {
          car.position.z += speed * dir;
          this.handlePoliceTurning(car, car.position.z);

          if (car.position.z > BOUNDS) car.position.z = -BOUNDS;
          if (car.position.z < -BOUNDS) car.position.z = BOUNDS;
      }

      this.updateCarOrientation(car);
  }

  private handlePoliceTurning(car: Group, currentPos: number) {
      if (car.userData.isPolice && car.userData.turnCooldown <= 0) {
          const roadIndex = Math.round((currentPos - (START_OFFSET - CELL_SIZE / 2)) / CELL_SIZE);
          const roadCenter = START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;

          if (Math.abs(currentPos - roadCenter) < car.userData.speed * 1.5) {
            if (Math.random() < 0.4) {
              const newDir = Math.random() > 0.5 ? 1 : -1;
              const newLaneOffset = (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

              if (car.userData.axis === "x") {
                  car.position.x = roadCenter + newLaneOffset;
                  car.userData.axis = "z";
                  car.userData.heading = newDir === 1 ? 0 : Math.PI;
              } else {
                  car.position.z = roadCenter + newLaneOffset;
                  car.userData.axis = "x";
                  car.userData.heading = newDir === 1 ? Math.PI / 2 : -Math.PI / 2;
              }
              car.userData.dir = newDir;
              car.userData.turnCooldown = 60;
            }
          }
      }
  }

  private fadeCar(car: Group) {
      if (car.userData.axis === "x") {
        car.position.x += car.userData.speed * 0.5 * car.userData.dir;
      } else {
        car.position.z += car.userData.speed * 0.5 * car.userData.dir;
      }

      this.updateCarOrientation(car);

      car.userData.opacity -= 0.02;
      if (car.userData.opacity <= 0) {
        this.resetCar(car);
      } else {
        car.traverse((child) => {
          if (child instanceof Mesh) {
            const mat = child.material;
            if (!Array.isArray(mat)) {
              const original = child.userData.originalOpacity !== undefined ? child.userData.originalOpacity : 1.0;
              mat.opacity = original * car.userData.opacity;
            }
          }
        });
      }
  }

  private updateCarOrientation(car: Group) {
      car.position.y = getHeight(car.position.x, car.position.z) + 1;
      const normal = getNormal(car.position.x, car.position.z);
      car.up.set(normal.x, normal.y, normal.z);

      const heading = car.userData.heading ?? 0;
      const lookDist = 5;
      const targetX = car.position.x + Math.sin(heading) * lookDist;
      const targetZ = car.position.z + Math.cos(heading) * lookDist;
      const targetY = getHeight(targetX, targetZ) + 1;
      car.lookAt(targetX, targetY, targetZ);
  }

  private checkCollisions() {
    const actualCollisionDist = 6;
    const distSqThreshold = actualCollisionDist * actualCollisionDist;

    for (let i = 0; i < this.cars.length; i++) {
      const carA = this.cars[i];
      if (carA.userData.fading) continue;

      for (let j = i + 1; j < this.cars.length; j++) {
        const carB = this.cars[j];
        if (carB.userData.fading) continue;

        const dx = carA.position.x - carB.position.x;
        const dz = carA.position.z - carB.position.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < distSqThreshold) {
          this.handleCollision(carA, carB);
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
        this.spawnSparks(player.position);
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
