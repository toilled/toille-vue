import { Group, Mesh, MeshBasicMaterial, PointLight } from 'three';
import { BOUNDS, CELL_SIZE, ROAD_WIDTH, START_OFFSET } from './config';
import { applyCarOrientation } from '../utils/HeightMap';

export class TrafficAI {
  static updateCars(cars: Group[], resetCar: (car: Group) => void) {
    const time = Date.now();
    const isRedOn = Math.floor(time / 150) % 2 === 0;

    for (const car of cars) {
      if (car.userData.isPolice) {
        TrafficAI.updatePoliceLights(car, isRedOn);
      }

      if (car.userData.isPlayerControlled) continue;

      if (!car.userData.fading) {
        TrafficAI.moveCar(car);
      } else {
        TrafficAI.fadeCar(car, resetCar);
      }
    }
  }

  static updatePoliceLights(car: Group, isRedOn: boolean) {
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

  static moveCar(car: Group) {
    if (car.userData.isPlayerHit) return;

    if (car.userData.turnCooldown > 0) {
      car.userData.turnCooldown--;
    }

    const speed = car.userData.speed;
    const dir = car.userData.dir;

    if (car.userData.axis === 'x') {
      car.position.x += speed * dir;
      TrafficAI.handlePoliceTurning(car, car.position.x);

      if (car.position.x > BOUNDS) car.position.x = -BOUNDS;
      if (car.position.x < -BOUNDS) car.position.x = BOUNDS;
    } else {
      car.position.z += speed * dir;
      TrafficAI.handlePoliceTurning(car, car.position.z);

      if (car.position.z > BOUNDS) car.position.z = -BOUNDS;
      if (car.position.z < -BOUNDS) car.position.z = BOUNDS;
    }

    TrafficAI.updateCarOrientation(car);
  }

  static isAtRoadCenter(car: Group, currentPos: number): boolean {
    const roadIndex = Math.round((currentPos - (START_OFFSET - CELL_SIZE / 2)) / CELL_SIZE);
    const roadCenter = START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;
    return Math.abs(currentPos - roadCenter) < car.userData.speed * 1.5;
  }

  static executePoliceTurn(car: Group) {
    const newDir = Math.random() > 0.5 ? 1 : -1;
    const laneOffset = (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

    if (car.userData.axis === 'x') {
      car.position.x =
        Math.round((car.position.x - (START_OFFSET - CELL_SIZE / 2)) / CELL_SIZE) * CELL_SIZE +
        (START_OFFSET - CELL_SIZE / 2) +
        laneOffset;
      car.userData.axis = 'z';
      car.userData.heading = newDir === 1 ? 0 : Math.PI;
    } else {
      car.position.z =
        Math.round((car.position.z - (START_OFFSET - CELL_SIZE / 2)) / CELL_SIZE) * CELL_SIZE +
        (START_OFFSET - CELL_SIZE / 2) +
        laneOffset;
      car.userData.axis = 'x';
      car.userData.heading = newDir === 1 ? Math.PI / 2 : -Math.PI / 2;
    }
    car.userData.dir = newDir;
    car.userData.turnCooldown = 60;
  }

  static handlePoliceTurning(car: Group, currentPos: number) {
    if (!car.userData.isPolice || car.userData.turnCooldown > 0) return;
    if (!TrafficAI.isAtRoadCenter(car, currentPos)) return;
    if (Math.random() >= 0.4) return;
    TrafficAI.executePoliceTurn(car);
  }

  static fadeCar(car: Group, resetCar: (car: Group) => void) {
    if (!car.userData._fadeInitialized) {
      car.traverse((child) => {
        if (child instanceof Mesh) {
          const mat = child.material;
          if (
            !Array.isArray(mat) &&
            child.userData.partType &&
            child.userData.partType !== 'hitbox'
          ) {
            const clone = mat.clone();
            clone.transparent = true;
            clone.depthWrite = false;
            child.userData._originalMaterial = mat;
            child.material = clone;
          }
        }
      });
      car.userData._fadeInitialized = true;
    }

    if (car.userData.axis === 'x') {
      car.position.x += car.userData.speed * 0.5 * car.userData.dir;
    } else {
      car.position.z += car.userData.speed * 0.5 * car.userData.dir;
    }

    TrafficAI.updateCarOrientation(car);

    car.userData.opacity -= 0.02;
    if (car.userData.opacity <= 0) {
      resetCar(car);
    } else {
      car.traverse((child) => {
        if (child instanceof Mesh) {
          const mat = child.material;
          if (!Array.isArray(mat)) {
            const original =
              child.userData.originalOpacity !== undefined ? child.userData.originalOpacity : 1.0;
            mat.opacity = original * car.userData.opacity;
          }
        }
      });
    }
  }

  static updateCarOrientation(car: Group) {
    const heading = car.userData.heading ?? 0;
    applyCarOrientation(car, heading);
  }
}
