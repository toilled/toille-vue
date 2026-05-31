import {
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PointLight,
  Scene,
  SpotLight,
} from "three";
import {
  BOUNDS,
  CELL_SIZE,
  CITY_SIZE,
  GRID_SIZE,
  ROAD_WIDTH,
  START_OFFSET,
} from "./config";
import { carAudio } from "./audio/CarAudio";
import { getHeight, applyCarOrientation } from "../utils/HeightMap";
import { CarFactory } from "./CarFactory";

const _matrix = new Matrix4();
const _color = new Color();

export class TrafficSystem {
  private scene: Scene;
  private cars: Group[] = [];
  private carCount: number;
  private spawnSparks: (pos: { x: number; y: number; z: number }) => void;
  private carFactory: CarFactory;

  private bodyMesh!: InstancedMesh;
  private cabMesh!: InstancedMesh;
  private trailerMesh!: InstancedMesh;
  private wheelMesh!: InstancedMesh;
  private tailLightMesh!: InstancedMesh;
  private headLightMesh!: InstancedMesh;

  constructor(
    scene: Scene,
    carCount: number,
    spawnSparks: (pos: { x: number; y: number; z: number }) => void,
  ) {
    this.scene = scene;
    this.carCount = carCount;
    this.spawnSparks = spawnSparks;
    this.carFactory = new CarFactory();
    this.initCars();
    this.createInstanceMeshes();
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

  private createInstanceMeshes() {
    const total = this.cars.length;
    const f = this.carFactory;

    this.bodyMesh = new InstancedMesh(f.carGeo, f.carBodyMat1, total);
    this.bodyMesh.castShadow = true;
    this.bodyMesh.count = 0;
    this.scene.add(this.bodyMesh);

    this.cabMesh = new InstancedMesh(f.truckCabGeo, f.carBodyMat1, total);
    this.cabMesh.castShadow = true;
    this.cabMesh.count = 0;
    this.scene.add(this.cabMesh);

    this.trailerMesh = new InstancedMesh(f.truckTrailerGeo, f.carBodyMat1, total);
    this.trailerMesh.castShadow = true;
    this.trailerMesh.count = 0;
    this.scene.add(this.trailerMesh);

    this.wheelMesh = new InstancedMesh(f.wheelGeo, f.wheelMat, total * 6);
    this.wheelMesh.castShadow = true;
    this.wheelMesh.count = 0;
    this.scene.add(this.wheelMesh);

    this.tailLightMesh = new InstancedMesh(f.tailLightGeo, f.tailLightMat, total * 2);
    this.tailLightMesh.count = 0;
    this.scene.add(this.tailLightMesh);

    this.headLightMesh = new InstancedMesh(f.headLightGeo, f.headLightMat, total * 2);
    this.headLightMesh.count = 0;
    this.scene.add(this.headLightMesh);
  }

  private syncCarInstances(activeCar: Group | null) {
    let bodyIdx = 0, cabIdx = 0, trailerIdx = 0;
    let wheelIdx = 0, tlIdx = 0, hlIdx = 0;

    for (const car of this.cars) {
      const isActive = car === activeCar;
      const isFading = car.userData.fading;
      const isPlayerControlled = car.userData.isPlayerControlled;
      const renderAsGroup = isActive || isFading || isPlayerControlled;

      car.updateWorldMatrix(true, false);

      car.traverse((child) => {
        if (!(child instanceof Mesh)) return;
        const partType = child.userData.partType as string | undefined;
        if (!partType) return;

        if (partType === "hitbox" || partType === "underglow" || partType === "lightbar" || partType === "flasher") {
          return;
        }

        if (renderAsGroup) {
          child.visible = true;
        } else {
          child.visible = false;

          _matrix.copy(child.matrixWorld);

          switch (partType) {
            case "body":
              this.bodyMesh.setMatrixAt(bodyIdx, _matrix);
              _color.copy(car.userData.bodyColor || 0x222222);
              this.bodyMesh.setColorAt(bodyIdx, _color);
              bodyIdx++;
              break;
            case "cab":
              this.cabMesh.setMatrixAt(cabIdx, _matrix);
              _color.copy(car.userData.bodyColor || 0x222222);
              this.cabMesh.setColorAt(cabIdx, _color);
              cabIdx++;
              break;
            case "trailer":
              this.trailerMesh.setMatrixAt(trailerIdx, _matrix);
              _color.copy(car.userData.bodyColor || 0x222222);
              this.trailerMesh.setColorAt(trailerIdx, _color);
              trailerIdx++;
              break;
            case "wheel":
              this.wheelMesh.setMatrixAt(wheelIdx, _matrix);
              wheelIdx++;
              break;
            case "taillight":
              this.tailLightMesh.setMatrixAt(tlIdx, _matrix);
              tlIdx++;
              break;
            case "headlight":
              this.headLightMesh.setMatrixAt(hlIdx, _matrix);
              hlIdx++;
              break;
          }
        }
      });
    }

    const updateCount = (mesh: InstancedMesh, count: number) => {
      mesh.count = count;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    updateCount(this.bodyMesh, bodyIdx);
    updateCount(this.cabMesh, cabIdx);
    updateCount(this.trailerMesh, trailerIdx);
    updateCount(this.wheelMesh, wheelIdx);
    updateCount(this.tailLightMesh, tlIdx);
    updateCount(this.headLightMesh, hlIdx);
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

    this.createSpotLight(
      car,
      xOffset,
      yPos,
      zFront,
      hlColor,
      hlIntensity,
      hlDist,
      hlAngle,
      hlPenumbra,
      36,
    );
    this.createSpotLight(
      car,
      -xOffset,
      yPos,
      zFront,
      hlColor,
      hlIntensity,
      hlDist,
      hlAngle,
      hlPenumbra,
      36,
    );

    const tlColor = 0xff0000;
    const tlIntensity = 50;
    const tlDist = 50;
    const tlAngle = Math.PI / 2.5;

    this.createSpotLight(
      car,
      xOffset,
      yPos,
      zBack,
      tlColor,
      tlIntensity,
      tlDist,
      tlAngle,
      0.5,
      -16,
    );
    this.createSpotLight(
      car,
      -xOffset,
      yPos,
      zBack,
      tlColor,
      tlIntensity,
      tlDist,
      tlAngle,
      0.5,
      -16,
    );
  }

  private createSpotLight(
    car: Group,
    x: number,
    y: number,
    z: number,
    color: number,
    intensity: number,
    distance: number,
    angle: number,
    penumbra: number,
    targetZOffset: number,
  ) {
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

    // Clean up fading materials
    if (carGroup.userData._fadeInitialized) {
      carGroup.traverse((child) => {
        if (child instanceof Mesh) {
          const mat = child.material;
          const orig = child.userData._originalMaterial as import("three").Material | undefined;
          if (!Array.isArray(mat) && orig) {
            mat.dispose();
            child.material = orig;
            delete child.userData._originalMaterial;
          }
        }
      });
      carGroup.userData._fadeInitialized = false;
    }

    this.removeLightsFromCar(carGroup);

    const axis = Math.random() > 0.5 ? "x" : "z";
    const dir = Math.random() > 0.5 ? 1 : -1;

    const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
    const roadCoordinate = START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;
    const laneOffset = (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

    let x = 0,
      z = 0;
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
      turnCooldown: 0,
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

  public update(activeCar?: Group | null) {
    this.updateCars();
    this.checkCollisions();
    this.syncCarInstances(activeCar || null);
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
      const roadIndex = Math.round(
        (currentPos - (START_OFFSET - CELL_SIZE / 2)) / CELL_SIZE,
      );
      const roadCenter = START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;

      if (Math.abs(currentPos - roadCenter) < car.userData.speed * 1.5) {
        if (Math.random() < 0.4) {
          const newDir = Math.random() > 0.5 ? 1 : -1;
          const newLaneOffset =
            (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

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
    // On first fade frame, clone shared materials for per-car opacity
    if (!car.userData._fadeInitialized) {
      car.traverse((child) => {
        if (child instanceof Mesh) {
          const mat = child.material;
          if (!Array.isArray(mat) && child.userData.partType && child.userData.partType !== "hitbox") {
            const clone = mat.clone();
            clone.transparent = true;
            child.userData._originalMaterial = mat;
            child.material = clone;
          }
        }
      });
      car.userData._fadeInitialized = true;
    }

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
            const original =
              child.userData.originalOpacity !== undefined
                ? child.userData.originalOpacity
                : 1.0;
            mat.opacity = original * car.userData.opacity;
          }
        }
      });
    }
  }

  private updateCarOrientation(car: Group) {
    const heading = car.userData.heading ?? 0;
    applyCarOrientation(car, heading);
  }

  private checkCollisions() {
    const actualCollisionDist = 6;
    const distSqThreshold = actualCollisionDist * actualCollisionDist;
    const gridSize = 20;
    const grid = new Map<string, Group[]>();

    for (const car of this.cars) {
      if (car.userData.fading) continue;
      const gridX = Math.floor(car.position.x / gridSize);
      const gridZ = Math.floor(car.position.z / gridSize);
      const key = `${gridX},${gridZ}`;

      if (!grid.has(key)) {
        grid.set(key, []);
      }
      grid.get(key)!.push(car);
    }

    for (const carA of this.cars) {
      if (carA.userData.fading) continue;

      const gridX = Math.floor(carA.position.x / gridSize);
      const gridZ = Math.floor(carA.position.z / gridSize);

      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const key = `${gridX + dx},${gridZ + dz}`;
          const neighbors = grid.get(key);

          if (neighbors) {
            for (const carB of neighbors) {
              if (carA.uuid >= carB.uuid || carB.userData.fading) continue;

              const distSq = carA.position.distanceToSquared(carB.position);

              if (distSq < distSqThreshold) {
                this.handleCollision(carA, carB);
              }
            }
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
