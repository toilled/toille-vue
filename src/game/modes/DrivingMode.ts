import { GameContext, GameMode } from '../types';
import { carAudio } from '../audio/CarAudio';
import { BOUNDS } from '../config';
import { Group } from 'three';
import { getHeight, getNormal, applyCarOrientation } from '../../utils/HeightMap';
import { handleControlsKeyDown, handleControlsKeyUp } from '../../utils/controls';
import { RedCarAI } from '../RedCarAI';
import { checkGridCollision, resolveBuildingCollision } from '../../utils/GridCollision';

export class DrivingMode implements GameMode {
  context: GameContext | null = null;
  private redCarAI: RedCarAI | null = null;

  get redCar(): Group | null {
    return this.redCarAI?.car ?? null;
  }

  get redCarSpeed(): number {
    return this.redCarAI?.speed ?? 0;
  }

  set redCarSpeed(speed: number) {
    if (this.redCarAI) this.redCarAI.speed = speed;
  }

  init(context: GameContext) {
    this.context = context;
    const { gameState } = context;
    if (!gameState.activeCar && gameState.cars.length > 0) {
      // Find a car to control (e.g. first one)
    }

    if (gameState.activeCar) {
      gameState.activeCar.userData.isPlayerControlled = true;
      gameState.activeCar.userData.currentSpeed = 0;
      if (gameState.activeCar.userData.heading === undefined) {
        gameState.activeCar.userData.heading = gameState.activeCar.rotation.y;
      }

      gameState.timeLeft = 30;
      gameState.isGameOver = false;
      gameState.spawnCheckpoint();
      carAudio.start();

      this.redCarAI = new RedCarAI(context);
      this.redCarAI.speed = 1.4;
      this.redCarAI.spawn();
    }
  }

  spawnRedCar() {
    this.redCarAI?.spawn();
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
    const { gameState } = this.context;
    const {
      checkpointMesh,
      navArrow,
      playPewSound,
      spawnCheckpoint,
      reportCheckpoint,
    } = gameState;

    gameState.timeLeft -= dt;
    if (gameState.timeLeft <= 0) {
      gameState.timeLeft = 0;
      gameState.isGameOver = true;
      navArrow.visible = false;
      return;
    }

    if (!checkpointMesh) return;

    const cx = car.position.x;
    const cz = car.position.z;
    const tx = checkpointMesh.position.x;
    const tz = checkpointMesh.position.z;
    const distSq = (cx - tx) ** 2 + (cz - tz) ** 2;
    gameState.distToTarget = Math.sqrt(distSq);

    if (distSq < 20 * 20) {
      gameState.drivingScore += 500;
      gameState.timeLeft += 15;
      playPewSound();
      spawnCheckpoint();
      reportCheckpoint();
      if (this.redCarAI) {
        this.redCarAI.speed = Math.min(this.redCarAI.speed + 0.1, 2.2);
      }
    }

    navArrow.visible = true;
    navArrow.position.copy(car.position);
    navArrow.position.y += 15;
    navArrow.lookAt(checkpointMesh.position.x, navArrow.position.y, checkpointMesh.position.z);
  }

  private computeCarSpeed(car: Group): number {
    if (!this.context) return 0;
    const { controls } = this.context.gameState;
    let speed = car.userData.currentSpeed || 0;
    const maxSpeed = 2;
    const acceleration = 0.1;
    const braking = 0.05;
    const friction = 0.99;

    if (controls.forward) {
      speed += speed < 0 ? braking : acceleration;
    } else if (controls.backward) {
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
    const { controls } = this.context!.gameState;
    const dir = speed > 0 ? 1 : -1;
    const turnSpeed = 0.04 / (Math.sqrt(Math.abs(speed)) + 1);
    if (controls.left) car.userData.heading += turnSpeed * dir;
    if (controls.right) car.userData.heading -= turnSpeed * dir;
  }

  private enforceCarBounds(car: Group) {
    if (car.position.x > BOUNDS) car.position.x = -BOUNDS;
    if (car.position.x < -BOUNDS) car.position.x = BOUNDS;
    if (car.position.z > BOUNDS) car.position.z = -BOUNDS;
    if (car.position.z < -BOUNDS) car.position.z = BOUNDS;
  }

  private checkBuildingCollision(car: Group) {
    if (!this.context) return;
    const { occupiedGrids, spawnSparks } = this.context.gameState;

    if (!checkGridCollision(car.position.x, car.position.z, occupiedGrids, 5)) return;

    const result = resolveBuildingCollision(car.position.x, car.position.z, occupiedGrids, 5);
    if (result.hit) {
      car.userData.currentSpeed *= -0.5;
      carAudio.playCrash();
      car.position.x += result.bounceX;
      car.position.z += result.bounceZ;
      spawnSparks(car.position);
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

  update(dt: number, _time: number) {
    if (!this.context) return;
    const { gameState } = this.context;
    if (!gameState.activeCar) return;

    const car = gameState.activeCar;

    if (gameState.isGameOver) {
      this.handleGameOver(car);
      return;
    }

    this.updateTimerAndCheckpoint(car, dt);
    const heading = this.updateCarPhysics(car);
    if (heading !== undefined) {
      this.followCarCamera(car, heading);
    }
    this.redCarAI?.update(car);
  }

  cleanup() {
    if (this.context) {
      const { gameState } = this.context;
      if (gameState.activeCar) {
        gameState.activeCar.userData.isPlayerControlled = false;
        gameState.activeCar = null;
      }
      gameState.navArrow.visible = false;
      if (gameState.chaseArrow) gameState.chaseArrow.visible = false;
      if (gameState.checkpointMesh) gameState.checkpointMesh.visible = false;

      this.redCarAI?.cleanup();

      const c = this.context.gameState.controls;
      c.forward = false;
      c.backward = false;
      c.left = false;
      c.right = false;

      carAudio.stop();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.context || this.context.gameState.isGameOver) return;
    handleControlsKeyDown(this.context.gameState.controls, event);
  }

  onKeyUp(event: KeyboardEvent) {
    if (!this.context || this.context.gameState.isGameOver) return;
    handleControlsKeyUp(this.context.gameState.controls, event);
  }

  onClick(_event: MouseEvent) {}
  onMouseMove(_event: MouseEvent) {}
}