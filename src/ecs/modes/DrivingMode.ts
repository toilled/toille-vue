import { GameModeComponent } from '../systems/GameModeSystem';
import { ECSWorld } from '../types';
import { Group } from 'three';
import { getHeight, getNormal, applyCarOrientation } from '../../utils/HeightMap';
import { handleControlsKeyDown, handleControlsKeyUp } from '../../utils/controls';
import { checkGridCollision, resolveBuildingCollision } from '../../utils/GridCollision';
import { RedCarAI } from '../../game/RedCarAI';
import { BOUNDS } from '../../game/config';

export const drivingModeComponent: GameModeComponent = {
  type: 'driving',
  init: (world: ECSWorld, entity: any) => {
    const res = world.resources;

    entity.activeCar = {
      group: res.activeCar.value!,
      isPlayerControlled: true,
      currentSpeed: 0,
      heading: res.activeCar.value!.rotation.y,
    };

    entity.activeCar.group.userData.isPlayerControlled = true;
    entity.activeCar.group.userData.currentSpeed = 0;
    entity.activeCar.group.userData.heading = entity.activeCar.group.rotation.y;

    res.timeLeft.value = 30;
    res.isGameOver.value = false;
    res.spawnCheckpoint();
    res.carAudio.start();

    entity.redCarAI = new RedCarAI({
      scene: res.scene,
      camera: res.camera,
      renderer: res.renderer,
      composer: res.composer,
      cars: res.cars,
      buildings: res.buildings,
      occupiedGrids: res.occupiedGrids,
      score: res.score,
      drivingScore: res.drivingScore,
      timeLeft: res.timeLeft,
      activeCar: res.activeCar,
      isMobile: res.isMobile,
      isGameOver: res.isGameOver,
      distToTarget: res.distToTarget,
      controls: res.controls,
      lookControls: res.lookControls,
      spawnSparks: res.spawnSparks,
      playPewSound: res.playPewSound,
      spawnCheckpoint: res.spawnCheckpoint,
      reportCheckpoint: res.reportCheckpoint,
      checkpointMesh: res.checkpointMesh,
      navArrow: res.navArrow,
      chaseArrow: res.chaseArrow,
      storyState: res.storyState,
      minimapData: res.minimapData,
      updateObjective: res.updateObjective,
      advanceDialogue: res.advanceDialogue,
      dismissBriefing: res.dismissBriefing,
      nearStoryTrigger: res.nearStoryTrigger,
      activateStoryTrigger: res.activateStoryTrigger,
    } as any);

    entity.redCarAI.speed = 1.4;
    entity.redCarAI.spawn();
  },

  update: (world: ECSWorld, entity: any, dt: number, _time: number) => {
    const res = world.resources;
    const activeCar = entity.activeCar;
    const redCarAI = entity.redCarAI;

    if (!activeCar || !activeCar.group) return;

    if (res.isGameOver.value) {
      handleGameOver(world, entity, activeCar.group, dt);
      return;
    }

    updateTimerAndCheckpoint(world, entity, activeCar.group, dt);

    const heading = updateCarPhysics(world, entity, activeCar.group, dt);
    if (heading !== undefined) {
      followCarCamera(world, activeCar.group, heading);
    }

    redCarAI?.update(activeCar.group, dt);
  },

  cleanup: (world: ECSWorld, entity: any) => {
    const res = world.resources;

    if (res.activeCar.value) {
      res.activeCar.value.userData.isPlayerControlled = false;
      res.activeCar.value = null;
    }

    res.navArrow.mesh.visible = false;
    if (res.chaseArrow) res.chaseArrow.visible = false;
    if (res.checkpointMesh) res.checkpointMesh.visible = false;

    entity.redCarAI?.cleanup();

    res.controls.value.forward = false;
    res.controls.value.backward = false;
    res.controls.value.left = false;
    res.controls.value.right = false;

    res.carAudio.stop();
  },

  onKeyDown: (world: ECSWorld, _entity: any, event: KeyboardEvent) => {
    const res = world.resources;
    if (res.isGameOver.value) return;
    handleControlsKeyDown(res.controls.value, event);
  },

  onKeyUp: (world: ECSWorld, _entity: any, event: KeyboardEvent) => {
    const res = world.resources;
    if (res.isGameOver.value) return;
    handleControlsKeyUp(res.controls.value, event);
  },
};

function handleGameOver(world: ECSWorld, _entity: any, car: Group, _dt: number) {
  const res = world.resources;

  car.userData.currentSpeed *= 0.95;
  if (Math.abs(car.userData.currentSpeed) < 0.01) car.userData.currentSpeed = 0;
  res.carAudio.update(car.userData.currentSpeed);

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

  followCarCamera(world, car, heading);
}

function updateTimerAndCheckpoint(world: ECSWorld, entity: any, car: Group, dt: number) {
  const res = world.resources;
  const redCarAI = entity.redCarAI;

  res.timeLeft.value -= dt;
  if (res.timeLeft.value <= 0) {
    res.timeLeft.value = 0;
    res.isGameOver.value = true;
    res.navArrow.mesh.visible = false;
    return;
  }

  if (!res.checkpointMesh) return;

  const cx = car.position.x;
  const cz = car.position.z;
  const tx = res.checkpointMesh.position.x;
  const tz = res.checkpointMesh.position.z;
  const distSq = (cx - tx) ** 2 + (cz - tz) ** 2;
  res.distToTarget.value = Math.sqrt(distSq);

  if (distSq < 20 * 20) {
    res.drivingScore.value += 500;
    res.timeLeft.value += 15;
    res.playPewSound();
    res.spawnCheckpoint();
    res.reportCheckpoint();
    if (redCarAI) {
      redCarAI.speed = Math.min(redCarAI.speed + 0.1, 2.2);
    }
  }

  res.navArrow.mesh.visible = true;
  res.navArrow.mesh.position.copy(car.position);
  res.navArrow.mesh.position.y += 15;
  res.navArrow.mesh.lookAt(
    res.checkpointMesh.position.x,
    res.navArrow.mesh.position.y,
    res.checkpointMesh.position.z
  );
}

function updateCarPhysics(
  world: ECSWorld,
  _entity: any,
  car: Group,
  _dt: number
): number | undefined {
  const res = world.resources;

  let speed = car.userData.currentSpeed || 0;
  const maxSpeed = 2;
  const acceleration = 0.1;
  const braking = 0.05;
  const friction = 0.99;

  if (res.controls.value.forward) {
    speed += speed < 0 ? braking : acceleration;
  } else if (res.controls.value.backward) {
    speed -= speed > 0 ? braking : acceleration;
  }

  speed *= friction;
  if (speed > maxSpeed) speed = maxSpeed;
  if (speed < -maxSpeed / 2) speed = -maxSpeed / 2;

  car.userData.currentSpeed = speed;
  res.carAudio.update(speed);

  if (Math.abs(speed) > 0.1) {
    const turnSpeed = 0.04 / (Math.sqrt(Math.abs(speed)) + 1);
    if (res.controls.value.left) car.userData.heading += turnSpeed;
    if (res.controls.value.right) car.userData.heading -= turnSpeed;
  }

  const heading = car.userData.heading ?? car.rotation.y;
  car.position.x += Math.sin(heading) * speed;
  car.position.z += Math.cos(heading) * speed;
  applyCarOrientation(car, heading);

  enforceCarBounds(car);
  checkBuildingCollision(world, car);

  return heading;
}

function enforceCarBounds(car: Group) {
  if (car.position.x > BOUNDS) car.position.x = -BOUNDS;
  if (car.position.x < -BOUNDS) car.position.x = BOUNDS;
  if (car.position.z > BOUNDS) car.position.z = -BOUNDS;
  if (car.position.z < -BOUNDS) car.position.z = BOUNDS;
}

function checkBuildingCollision(world: ECSWorld, car: Group) {
  const res = world.resources;

  if (!checkGridCollision(car.position.x, car.position.z, res.occupiedGrids, 5)) return;

  const result = resolveBuildingCollision(car.position.x, car.position.z, res.occupiedGrids, 5);
  if (result.hit) {
    car.userData.currentSpeed *= -0.5;
    res.carAudio.playCrash();
    car.position.x += result.bounceX;
    car.position.z += result.bounceZ;
    res.spawnSparks({ x: car.position.x, y: car.position.y, z: car.position.z });
  }
}

function followCarCamera(world: ECSWorld, car: Group, heading: number) {
  const res = world.resources;
  const camera = res.camera;
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
