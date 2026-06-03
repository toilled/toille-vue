import { GameContext, GameMode } from "../types";
import { carAudio } from "../audio/CarAudio";
import {
  BOUNDS,
  CELL_SIZE,
  START_OFFSET,
  GRID_SIZE,
  CITY_SIZE,
} from "../config";
import {
  Group,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  SpotLight,
  Object3D,
} from "three";
import { getHeight, getNormal, applyCarOrientation } from "../../utils/HeightMap";

export class DrivingMode implements GameMode {
  context: GameContext | null = null;
  redCar: Group | null = null;
  redCarSpeed: number = 0;

  init(context: GameContext) {
    this.context = context;
    if (!context.activeCar.value && context.cars.length > 0) {
      // Find a car to control (e.g. first one)
    }

    if (context.activeCar.value) {
      context.activeCar.value.userData.isPlayerControlled = true;
      context.activeCar.value.userData.currentSpeed = 0;
      // Initialize heading if not present
      if (context.activeCar.value.userData.heading === undefined) {
        context.activeCar.value.userData.heading =
          context.activeCar.value.rotation.y;
      }

      context.timeLeft.value = 30;
      context.isGameOver.value = false;
      context.spawnCheckpoint();
      carAudio.start();

      // Init Red Car Speed
      this.redCarSpeed = 1.4;

      // Spawn Red Car
      this.spawnRedCar();
    }
  }

  spawnRedCar() {
    if (!this.context) return;

    // Create Red Car Mesh
    const carGroup = new Group();

    // Car Body
    const bodyGeo = new BoxGeometry(14, 4, 30);
    const bodyMat = new MeshStandardMaterial({
      color: 0xff0000,
      roughness: 0.2,
      metalness: 0.6,
    });
    const body = new Mesh(bodyGeo, bodyMat);
    body.position.y = 3;
    body.castShadow = true;
    carGroup.add(body);

    // Cabin
    const cabinGeo = new BoxGeometry(12, 3, 16);
    const cabinMat = new MeshStandardMaterial({
      color: 0x330000,
      roughness: 0.2,
      metalness: 0.8,
    });
    const cabin = new Mesh(cabinGeo, cabinMat);
    cabin.position.y = 6.5;
    cabin.position.z = -2;
    carGroup.add(cabin);

    // Add Lights (Red Glow)
    const light = new SpotLight(0xff0000, 200, 100, Math.PI / 3, 0.5, 1);
    light.position.set(0, 10, 0);
    const target = new Object3D();
    target.position.set(0, 0, 10);
    carGroup.add(target);
    light.target = target;
    carGroup.add(light);

    this.redCar = carGroup;
    this.context.scene.add(this.redCar);

    // Position it far away
    this.respawnRedCar();
  }

  respawnRedCar() {
    if (!this.context || !this.redCar) return;
    const player = this.context.activeCar.value;
    if (!player) return;

    // Find a valid road position far from player
    let spawned = false;
    let attempts = 0;
    while (!spawned && attempts < 20) {
      const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
      const roadCoordinate =
        START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;
      const otherCoord = (Math.random() - 0.5) * CITY_SIZE;

      const axis = Math.random() > 0.5 ? "x" : "z";
      let x, z;

      if (axis === "x") {
        z = roadCoordinate; // Road runs x-axis
        x = otherCoord;
        this.redCar.userData.heading =
          Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        x = roadCoordinate; // Road runs z-axis
        z = otherCoord;
        this.redCar.userData.heading = Math.random() > 0.5 ? 0 : Math.PI;
      }

      // Check dist
      const dist = Math.sqrt(
        (x - player.position.x) ** 2 + (z - player.position.z) ** 2,
      );
      if (dist > 500) {
        const h = getHeight(x, z);
        this.redCar.position.set(x, h + 1, z);
        spawned = true;
      }
      attempts++;
    }
  }

  private handleGameOver(car: Group) {
    car.userData.currentSpeed *= 0.95;
    if (Math.abs(car.userData.currentSpeed) < 0.01) car.userData.currentSpeed = 0;
    carAudio.update(car.userData.currentSpeed);

    const speed = car.userData.currentSpeed;
    const heading = car.userData.heading ?? car.rotation.y;
    car.position.x += Math.sin(heading) * speed;
    car.position.z += Math.cos(heading) * speed;
    car.position.y = getHeight(car.position.x, car.position.z) + 1;

    const normal = getNormal(car.position.x, car.position.z);
    car.up.set(normal.x, normal.y, normal.z);
    const lookDist = 5;
    const tx = car.position.x + Math.sin(heading) * lookDist;
    const tz = car.position.z + Math.cos(heading) * lookDist;
    const ty = getHeight(tx, tz) + 1;
    car.lookAt(tx, ty, tz);

    this.followCarCamera(car, heading);
  }

  private followCarCamera(car: Group, heading: number) {
    if (!this.context) return;
    const { camera } = this.context;
    const dist = 40;
    const height = 20;
    const targetX = car.position.x - Math.sin(heading) * dist;
    const targetZ = car.position.z - Math.cos(heading) * dist;
    const targetY = car.position.y + height;
    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.z += (targetZ - camera.position.z) * 0.1;
    camera.position.y += (targetY - camera.position.y) * 0.1;
    camera.lookAt(car.position.x, car.position.y, car.position.z);
  }

  private updateTimerAndCheckpoint(car: Group, dt: number) {
    if (!this.context) return;
    const { timeLeft, checkpointMesh, navArrow, drivingScore, playPewSound, spawnCheckpoint, isGameOver, distToTarget } = this.context;

    timeLeft.value -= dt;
    if (timeLeft.value <= 0) {
      timeLeft.value = 0;
      isGameOver.value = true;
      navArrow.visible = false;
      return;
    }

    if (!checkpointMesh) return;

    const cx = car.position.x;
    const cz = car.position.z;
    const tx = checkpointMesh.position.x;
    const tz = checkpointMesh.position.z;
    const distSq = (cx - tx) ** 2 + (cz - tz) ** 2;
    distToTarget.value = Math.sqrt(distSq);

    if (distSq < 20 * 20) {
      drivingScore.value += 500;
      timeLeft.value += 15;
      playPewSound();
      spawnCheckpoint();
      this.redCarSpeed = Math.min(this.redCarSpeed + 0.1, 2.2);
    }

    navArrow.visible = true;
    navArrow.position.copy(car.position);
    navArrow.position.y += 15;
    navArrow.lookAt(checkpointMesh.position.x, navArrow.position.y, checkpointMesh.position.z);
  }

  private computeCarSpeed(car: Group): number {
    const { controls } = this.context!;
    let speed = car.userData.currentSpeed || 0;
    const maxSpeed = 2;
    const acceleration = 0.1;
    const braking = 0.05;
    const friction = 0.99;

    if (controls.value.forward) {
      speed += speed < 0 ? braking : acceleration;
    } else if (controls.value.backward) {
      speed -= speed > 0 ? braking : acceleration;
    }

    speed *= friction;
    if (speed > maxSpeed) speed = maxSpeed;
    if (speed < -maxSpeed / 2) speed = -maxSpeed / 2;

    car.userData.currentSpeed = speed;
    carAudio.update(speed);
    return speed;
  }

  private applyCarSteering(car: Group, speed: number) {
    if (Math.abs(speed) <= 0.1) return;
    const { controls } = this.context!;
    const dir = speed > 0 ? 1 : -1;
    const turnSpeed = 0.04 / (Math.sqrt(Math.abs(speed)) + 1);
    if (controls.value.left) car.userData.heading += turnSpeed * dir;
    if (controls.value.right) car.userData.heading -= turnSpeed * dir;
  }

  private enforceCarBounds(car: Group) {
    if (car.position.x > BOUNDS) car.position.x = -BOUNDS;
    if (car.position.x < -BOUNDS) car.position.x = BOUNDS;
    if (car.position.z > BOUNDS) car.position.z = -BOUNDS;
    if (car.position.z < -BOUNDS) car.position.z = BOUNDS;
  }

  private checkBuildingCollision(car: Group) {
    if (!this.context) return;
    const { occupiedGrids, spawnSparks } = this.context;
    const ix = Math.round((car.position.x - START_OFFSET) / CELL_SIZE);
    const iz = Math.round((car.position.z - START_OFFSET) / CELL_SIZE);
    const gridKey = `${ix},${iz}`;

    if (!occupiedGrids.has(gridKey)) return;
    const cX = START_OFFSET + ix * CELL_SIZE;
    const cZ = START_OFFSET + iz * CELL_SIZE;
    const dims = occupiedGrids.get(gridKey);
    if (dims) {
      this.handleBuildingCollision(car, dims, cX, cZ, spawnSparks);
    }
  }

  private updateCarPhysics(car: Group): number | undefined {
    if (!this.context) return;

    const speed = this.computeCarSpeed(car);
    this.applyCarSteering(car, speed);

    const heading = car.userData.heading ?? car.rotation.y;
    car.position.x += Math.sin(heading) * speed;
    car.position.z += Math.cos(heading) * speed;
    applyCarOrientation(car, heading);

    this.enforceCarBounds(car);
    this.checkBuildingCollision(car);

    return heading;
  }

  private handleBuildingCollision(car: Group, dims: { halfW: number; halfD: number; isRound?: boolean }, cX: number, cZ: number, spawnSparks: (pos: { x: number; y: number; z: number }) => void) {
    const margin = 5;
    if (dims.isRound) {
      const radius = Math.max(dims.halfW, dims.halfD);
      const dx = car.position.x - cX;
      const dz = car.position.z - cZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < radius + margin) {
        car.userData.currentSpeed *= -0.5;
        carAudio.playCrash();
        let normalX = 0;
        let normalZ = 1;
        if (dist > 0.001) {
          normalX = dx / dist;
          normalZ = dz / dist;
        }
        car.position.x += normalX * (radius + margin - dist + 2);
        car.position.z += normalZ * (radius + margin - dist + 2);
        spawnSparks(car.position);
      }
    } else if (Math.abs(car.position.x - cX) < dims.halfW + margin && Math.abs(car.position.z - cZ) < dims.halfD + margin) {
      car.userData.currentSpeed *= -0.5;
      carAudio.playCrash();
      car.position.x += Math.sign(car.position.x - cX) * 2;
      car.position.z += Math.sign(car.position.z - cZ) * 2;
      spawnSparks(car.position);
    }
  }

  update(dt: number, _time: number) {
    if (!this.context) return;
    const { activeCar, isGameOver } = this.context;
    if (!activeCar.value) return;

    const car = activeCar.value;

    if (isGameOver.value) {
      this.handleGameOver(car);
      return;
    }

    this.updateTimerAndCheckpoint(car, dt);
    const heading = this.updateCarPhysics(car);
    if (heading !== undefined) {
      this.followCarCamera(car, heading);
    }
    this.updateRedCar(car);
  }

  private moveRedCar() {
    if (!this.redCar) return;
    const heading = this.redCar.userData.heading ?? 0;
    const speed = this.redCarSpeed;
    this.redCar.position.x += Math.sin(heading) * speed;
    this.redCar.position.z += Math.cos(heading) * speed;
    this.redCar.position.y = getHeight(this.redCar.position.x, this.redCar.position.z) + 1;

    const normal = getNormal(this.redCar.position.x, this.redCar.position.z);
    this.redCar.up.set(normal.x, normal.y, normal.z);
    const lookDist = 5;
    const tx = this.redCar.position.x + Math.sin(heading) * lookDist;
    const tz = this.redCar.position.z + Math.cos(heading) * lookDist;
    const ty = getHeight(tx, tz) + 1;
    this.redCar.lookAt(tx, ty, tz);
  }

  private steerTowardsPlayer(playerCar: Group) {
    if (!this.redCar) return;
    const heading = this.redCar.userData.heading ?? 0;
    const isZAxis = Math.abs(Math.cos(heading)) > 0.5;

    const roadHalf = CELL_SIZE / 2;
    const gridX = Math.round((this.redCar.position.x - START_OFFSET - roadHalf) / CELL_SIZE);
    const gridZ = Math.round((this.redCar.position.z - START_OFFSET - roadHalf) / CELL_SIZE);
    const roadCenterX = START_OFFSET + gridX * CELL_SIZE + roadHalf;
    const roadCenterZ = START_OFFSET + gridZ * CELL_SIZE + roadHalf;

    const lateralSpeed = this.redCarSpeed * 0.3;
    const maxOffset = 18;

    if (isZAxis) {
      const targetX = Math.max(roadCenterX - maxOffset, Math.min(roadCenterX + maxOffset, playerCar.position.x));
      const diff = targetX - this.redCar.position.x;
      if (Math.abs(diff) > 0.1) {
        this.redCar.position.x += Math.sign(diff) * Math.min(Math.abs(diff), lateralSpeed);
      }
    } else {
      const targetZ = Math.max(roadCenterZ - maxOffset, Math.min(roadCenterZ + maxOffset, playerCar.position.z));
      const diff = targetZ - this.redCar.position.z;
      if (Math.abs(diff) > 0.1) {
        this.redCar.position.z += Math.sign(diff) * Math.min(Math.abs(diff), lateralSpeed);
      }
    }

    return { roadCenterX, roadCenterZ, isZAxis };
  }

  private handleRedCarIntersection(roadCenterX: number, roadCenterZ: number, isZAxis: boolean, playerCar: Group) {
    if (!this.redCar) return;
    const longDist = isZAxis
      ? Math.abs(this.redCar.position.z - roadCenterZ)
      : Math.abs(this.redCar.position.x - roadCenterX);
    const latDist = isZAxis
      ? Math.abs(this.redCar.position.x - roadCenterX)
      : Math.abs(this.redCar.position.z - roadCenterZ);

    if (longDist >= 5 || latDist >= 25) return;

    const directions = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    let bestDir = this.redCar.userData.heading ?? 0;
    let minDst = Infinity;
    const curDirX = Math.sin(bestDir);
    const curDirZ = Math.cos(bestDir);

    for (const dir of directions) {
      const dx = Math.sin(dir);
      const dz = Math.cos(dir);
      if (dx * curDirX + dz * curDirZ < -0.9) continue;
      const d = ((this.redCar.position.x + dx * 100) - playerCar.position.x) ** 2 +
                ((this.redCar.position.z + dz * 100) - playerCar.position.z) ** 2;
      if (d < minDst) {
        minDst = d;
        bestDir = dir;
      }
    }

    this.redCar.userData.heading = bestDir;
    this.redCar.position.x += Math.sin(bestDir) * 6;
    this.redCar.position.z += Math.cos(bestDir) * 6;
  }

  private updateRedCarBounds() {
    if (!this.redCar) return;
    if (this.redCar.position.x > BOUNDS) this.redCar.position.x = -BOUNDS;
    if (this.redCar.position.x < -BOUNDS) this.redCar.position.x = BOUNDS;
    if (this.redCar.position.z > BOUNDS) this.redCar.position.z = -BOUNDS;
    if (this.redCar.position.z < -BOUNDS) this.redCar.position.z = BOUNDS;
  }

  private checkRedCarCollision(playerCar: Group) {
    if (!this.redCar || !this.context || !this.context.isGameOver) return;
    const dist = this.redCar.position.distanceTo(playerCar.position);
    if (dist < 10) {
      this.context.isGameOver.value = true;
    }
  }

  private updateChaseArrow(playerCar: Group) {
    if (!this.context || !this.context.chaseArrow || !this.redCar) return;
    const arrow = this.context.chaseArrow;
    arrow.visible = true;
    arrow.position.copy(playerCar.position);
    arrow.position.y += 3;
    arrow.lookAt(this.redCar.position);

    const dist = this.redCar.position.distanceTo(playerCar.position);
    const op = dist < 200 ? 1 : dist > 600 ? 0 : 1 - (dist - 200) / 400;

    arrow.traverse((c) => {
      if ("material" in c && c.material) {
        (c.material as { opacity: number }).opacity = op;
      }
    });
  }

  updateRedCar(playerCar: Group) {
    if (!this.redCar) return;

    this.moveRedCar();
    const road = this.steerTowardsPlayer(playerCar);
    if (road) {
      this.handleRedCarIntersection(road.roadCenterX, road.roadCenterZ, road.isZAxis, playerCar);
    }
    this.updateRedCarBounds();
    this.checkRedCarCollision(playerCar);
    this.updateChaseArrow(playerCar);
  }

  cleanup() {
    if (this.context) {
      if (this.context.activeCar.value) {
        this.context.activeCar.value.userData.isPlayerControlled = false;
        this.context.activeCar.value = null;
      }
      this.context.navArrow.visible = false;
      if (this.context.chaseArrow) this.context.chaseArrow.visible = false;
      if (this.context.checkpointMesh)
        this.context.checkpointMesh.visible = false;

      if (this.redCar) {
        this.context.scene.remove(this.redCar);
        this.redCar = null;
      }

      const c = this.context.controls.value;
      c.forward = false;
      c.backward = false;
      c.left = false;
      c.right = false;

      carAudio.stop();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.context || this.context.isGameOver.value) return;
    const c = this.context.controls.value;
    switch (event.key.toLowerCase()) {
      case "w":
      case "arrowup":
        c.forward = true;
        break;
      case "s":
      case "arrowdown":
        c.backward = true;
        break;
      case "a":
      case "arrowleft":
        c.left = true;
        break;
      case "d":
      case "arrowright":
        c.right = true;
        break;
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (!this.context || this.context.isGameOver.value) return;
    const c = this.context.controls.value;
    switch (event.key.toLowerCase()) {
      case "w":
      case "arrowup":
        c.forward = false;
        break;
      case "s":
      case "arrowdown":
        c.backward = false;
        break;
      case "a":
      case "arrowleft":
        c.left = false;
        break;
      case "d":
      case "arrowright":
        c.right = false;
        break;
    }
  }

  onClick(_event: MouseEvent) {}
  onMouseMove(_event: MouseEvent) {}
}
