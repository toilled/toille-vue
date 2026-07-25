import { BOUNDS, CELL_SIZE, START_OFFSET, GRID_SIZE, CITY_SIZE } from './config';
import { Group, BoxGeometry, MeshStandardMaterial, Mesh, SpotLight, Object3D } from 'three';
import { getHeight, getNormal } from '../utils/HeightMap';
import { GameContext } from './types';
import {
  steerTowardsPlayer,
  handleIntersection as handleIntersectionMath,
  enforceBounds,
  type RedCarState,
} from './redCarMath';

function redCarStateFromGroup(car: Group, speed: number): RedCarState {
  return {
    x: car.position.x,
    y: car.position.y,
    z: car.position.z,
    heading: car.userData.heading ?? 0,
    speed,
    active: true,
  };
}

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

      const axis = Math.random() > 0.5 ? 'x' : 'z';
      let x = 0,
        z = 0;

      if (axis === 'x') {
        z = roadCoordinate;
        x = otherCoord;
        this.car.userData.heading = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        x = roadCoordinate;
        z = otherCoord;
        this.car.userData.heading = Math.random() > 0.5 ? 0 : Math.PI;
      }

      const dist = Math.sqrt((x - player.position.x) ** 2 + (z - player.position.z) ** 2);
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
    const redCarState = redCarStateFromGroup(this.car, this.speed);

    const { roadCenterX, roadCenterZ, isZAxis } = steerTowardsPlayer(
      redCarState,
      playerCar.position.x,
      playerCar.position.z,
      { cellSize: CELL_SIZE, startOffset: START_OFFSET, bounds: BOUNDS }
    );

    this.car.position.x = redCarState.x;
    this.car.position.z = redCarState.z;

    return { roadCenterX, roadCenterZ, isZAxis };
  }

  handleIntersection(roadCenterX: number, roadCenterZ: number, isZAxis: boolean, playerCar: Group) {
    if (!this.car) return;
    const redCarState = redCarStateFromGroup(this.car, this.speed);

    handleIntersectionMath(
      redCarState,
      roadCenterX,
      roadCenterZ,
      isZAxis,
      playerCar.position.x,
      playerCar.position.z
    );

    this.car.position.x = redCarState.x;
    this.car.position.z = redCarState.z;
    this.car.userData.heading = redCarState.heading;
  }

  enforceBounds() {
    if (!this.car) return;
    const redCarState = redCarStateFromGroup(this.car, this.speed);

    enforceBounds(redCarState, BOUNDS);

    this.car.position.x = redCarState.x;
    this.car.position.z = redCarState.z;
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
      if ('material' in c && c.material) {
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
