import { BOUNDS, CELL_SIZE, START_OFFSET, GRID_SIZE, CITY_SIZE } from "./config";
import { Group, BoxGeometry, MeshStandardMaterial, Mesh, SpotLight, Object3D } from "three";
import { getHeight, getNormal } from "../utils/HeightMap";
import { GameContext } from "./types";

export class RedCarAI {
  car: Group | null = null;
  speed: number = 1.4;
  private context: GameContext;

  constructor(context: GameContext) {
    this.context = context;
  }

  spawn() {
    const carGroup = new Group();

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

    const light = new SpotLight(0xff0000, 200, 100, Math.PI / 3, 0.5, 1);
    light.position.set(0, 10, 0);
    const target = new Object3D();
    target.position.set(0, 0, 10);
    carGroup.add(target);
    light.target = target;
    carGroup.add(light);

    this.car = carGroup;
    this.context.scene.add(this.car);
    this.respawn();
  }

  respawn() {
    const player = this.context.activeCar.value;
    if (!this.car || !player) return;

    let spawned = false;
    let attempts = 0;
    while (!spawned && attempts < 20) {
      const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
      const roadCoordinate = START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;
      const otherCoord = (Math.random() - 0.5) * CITY_SIZE;

      const axis = Math.random() > 0.5 ? "x" : "z";
      let x = 0, z = 0;

      if (axis === "x") {
        z = roadCoordinate;
        x = otherCoord;
        this.car.userData.heading = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        x = roadCoordinate;
        z = otherCoord;
        this.car.userData.heading = Math.random() > 0.5 ? 0 : Math.PI;
      }

      const dist = Math.sqrt(
        (x - player.position.x) ** 2 + (z - player.position.z) ** 2,
      );
      if (dist > 500) {
        const h = getHeight(x, z);
        this.car.position.set(x, h + 1, z);
        spawned = true;
      }
      attempts++;
    }
  }

  move() {
    if (!this.car) return;
    const heading = this.car.userData.heading ?? 0;
    this.car.position.x += Math.sin(heading) * this.speed;
    this.car.position.z += Math.cos(heading) * this.speed;
    this.car.position.y = getHeight(this.car.position.x, this.car.position.z) + 1;

    const normal = getNormal(this.car.position.x, this.car.position.z);
    this.car.up.set(normal.x, normal.y, normal.z);
    const lookDist = 5;
    const tx = this.car.position.x + Math.sin(heading) * lookDist;
    const tz = this.car.position.z + Math.cos(heading) * lookDist;
    const ty = getHeight(tx, tz) + 1;
    this.car.lookAt(tx, ty, tz);
  }

  steerTowardsPlayer(playerCar: Group) {
    if (!this.car) return;
    const heading = this.car.userData.heading ?? 0;
    const isZAxis = Math.abs(Math.cos(heading)) > 0.5;

    const roadHalf = CELL_SIZE / 2;
    const gridX = Math.round((this.car.position.x - START_OFFSET - roadHalf) / CELL_SIZE);
    const gridZ = Math.round((this.car.position.z - START_OFFSET - roadHalf) / CELL_SIZE);
    const roadCenterX = START_OFFSET + gridX * CELL_SIZE + roadHalf;
    const roadCenterZ = START_OFFSET + gridZ * CELL_SIZE + roadHalf;

    const lateralSpeed = this.speed * 0.3;
    const maxOffset = 18;

    if (isZAxis) {
      const targetX = Math.max(roadCenterX - maxOffset, Math.min(roadCenterX + maxOffset, playerCar.position.x));
      const diff = targetX - this.car.position.x;
      if (Math.abs(diff) > 0.1) {
        this.car.position.x += Math.sign(diff) * Math.min(Math.abs(diff), lateralSpeed);
      }
    } else {
      const targetZ = Math.max(roadCenterZ - maxOffset, Math.min(roadCenterZ + maxOffset, playerCar.position.z));
      const diff = targetZ - this.car.position.z;
      if (Math.abs(diff) > 0.1) {
        this.car.position.z += Math.sign(diff) * Math.min(Math.abs(diff), lateralSpeed);
      }
    }

    return { roadCenterX, roadCenterZ, isZAxis };
  }

  handleIntersection(roadCenterX: number, roadCenterZ: number, isZAxis: boolean, playerCar: Group) {
    if (!this.car) return;
    const longDist = isZAxis
      ? Math.abs(this.car.position.z - roadCenterZ)
      : Math.abs(this.car.position.x - roadCenterX);
    const latDist = isZAxis
      ? Math.abs(this.car.position.x - roadCenterX)
      : Math.abs(this.car.position.z - roadCenterZ);

    if (longDist >= 5 || latDist >= 25) return;

    const directions = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    let bestDir = this.car.userData.heading ?? 0;
    let minDst = Infinity;
    const curDirX = Math.sin(bestDir);
    const curDirZ = Math.cos(bestDir);

    for (const dir of directions) {
      const dx = Math.sin(dir);
      const dz = Math.cos(dir);
      if (dx * curDirX + dz * curDirZ < -0.9) continue;
      const d = ((this.car.position.x + dx * 100) - playerCar.position.x) ** 2 +
                ((this.car.position.z + dz * 100) - playerCar.position.z) ** 2;
      if (d < minDst) {
        minDst = d;
        bestDir = dir;
      }
    }

    this.car.userData.heading = bestDir;
    this.car.position.x += Math.sin(bestDir) * 6;
    this.car.position.z += Math.cos(bestDir) * 6;
  }

  enforceBounds() {
    if (!this.car) return;
    if (this.car.position.x > BOUNDS) this.car.position.x = -BOUNDS;
    if (this.car.position.x < -BOUNDS) this.car.position.x = BOUNDS;
    if (this.car.position.z > BOUNDS) this.car.position.z = -BOUNDS;
    if (this.car.position.z < -BOUNDS) this.car.position.z = BOUNDS;
  }

  checkCollision(playerCar: Group) {
    if (!this.car) return;
    const dist = this.car.position.distanceTo(playerCar.position);
    if (dist < 10) {
      this.context.isGameOver.value = true;
    }
  }

  updateChaseArrow(playerCar: Group) {
    if (!this.context.chaseArrow || !this.car) return;
    const arrow = this.context.chaseArrow;
    arrow.visible = true;
    arrow.position.copy(playerCar.position);
    arrow.position.y += 3;
    arrow.lookAt(this.car.position);

    const dist = this.car.position.distanceTo(playerCar.position);
    const op = dist < 200 ? 1 : dist > 600 ? 0 : 1 - (dist - 200) / 400;

    arrow.traverse((c) => {
      if ("material" in c && c.material) {
        (c.material as { opacity: number }).opacity = op;
      }
    });
  }

  update(playerCar: Group) {
    if (!this.car) return;

    this.move();
    const road = this.steerTowardsPlayer(playerCar);
    if (road) {
      this.handleIntersection(road.roadCenterX, road.roadCenterZ, road.isZAxis, playerCar);
    }
    this.enforceBounds();
    this.checkCollision(playerCar);
    this.updateChaseArrow(playerCar);
  }

  cleanup() {
    if (this.car) {
      this.context.scene.remove(this.car);
      this.car = null;
    }
  }
}
