import { GameModeComponent } from '../systems/GameModeSystem';
import { ECSWorld } from '../types';
import { Vector3, Euler, Quaternion } from 'three';
import { getHeight } from '../../utils/HeightMap';
import { handleControlsKeyDown, handleControlsKeyUp } from '../../utils/controls';
import { checkGridCollision } from '../../utils/GridCollision';
import { STORY_TRIGGER_POSITION } from '../../game/StoryItemsManager';
import { carAudio } from '../../game/audio/CarAudio';

export const explorationModeComponent: GameModeComponent = {
  type: 'exploration',
  init: (world: ECSWorld, entity: any) => {
    const res = world.resources;

    entity.playerState = {
      isTransitioning: true,
      isJumping: false,
      velocityY: 0,
      playerRotation: new Euler(0, 0, 0, 'YXZ'),
      lastObjectiveProximityCheck: 0,
    };

    entity.jumpState = {
      gravity: 0.015,
      jumpStrength: 0.4,
    };

    if (!res.isMobile.value && res.renderer) {
      document.body.requestPointerLock();
    }
  },

  update: (world: ECSWorld, entity: any, dt: number, _time: number) => {
    const res = world.resources;
    const playerState = entity.playerState;
    const jumpState = entity.jumpState;

    if (playerState.isTransitioning) {
      if (handleTransition(world, entity, playerState, dt)) return;
    }

    if (res.isMobile.value) {
      handleMobileLook(world, playerState);
    }

    processMovement(world, entity, playerState, dt);

    enforceCameraBounds(world, res.camera);

    updateJumpAndBob(world, entity, playerState, jumpState, dt);

    checkCarCollisions(world, res.camera);

    updateProximityAndNavigation(world, entity, res.camera.position.x, res.camera.position.z);

    updateMinimap(world, res.camera.position.x, res.camera.position.z);
  },

  cleanup: (_world: ECSWorld, _entity: any) => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  },

  onKeyDown: (world: ECSWorld, entity: any, event: KeyboardEvent) => {
    const res = world.resources;
    const playerState = entity.playerState;

    if (event.code === 'Space' && !playerState.isJumping) {
      playerState.isJumping = true;
      playerState.velocityY = entity.jumpState.jumpStrength;
    }

    handleStoryInteraction(world, entity, event);

    handleControlsKeyDown(res.controls.value, event);
  },

  onKeyUp: (world: ECSWorld, _entity: any, event: KeyboardEvent) => {
    const res = world.resources;
    handleControlsKeyUp(res.controls.value, event);
  },

  onClick: (world: ECSWorld, _entity: any, _event: MouseEvent) => {
    const res = world.resources;
    if (advanceStoryFromEvent(world)) return;
    if (!res.isMobile.value && document.pointerLockElement !== document.body) {
      document.body.requestPointerLock();
    }
  },

  onMouseMove: (world: ECSWorld, entity: any, event: MouseEvent) => {
    const res = world.resources;
    const playerState = entity.playerState;

    if (res.isMobile.value) return;
    if (document.pointerLockElement !== document.body) return;

    const sensitivity = 0.002;
    playerState.playerRotation.y -= event.movementX * sensitivity;
    playerState.playerRotation.x -= event.movementY * sensitivity;

    playerState.playerRotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, playerState.playerRotation.x)
    );
    res.camera.rotation.copy(playerState.playerRotation);
  },
};

function handleTransition(world: ECSWorld, _entity: any, playerState: any, _dt: number): boolean {
  const res = world.resources;
  const camera = res.camera;

  const targetPos = new Vector3(0, 3, 0);
  const targetQ = new Quaternion().setFromEuler(playerState.playerRotation);

  camera.position.lerp(targetPos, 0.05);
  camera.quaternion.slerp(targetQ, 0.05);

  if (camera.position.distanceTo(targetPos) < 1) {
    playerState.isTransitioning = false;
    camera.position.copy(targetPos);
    camera.rotation.copy(playerState.playerRotation);
    return false;
  }
  return true;
}

function handleMobileLook(world: ECSWorld, playerState: any) {
  const res = world.resources;
  const camera = res.camera;
  const lookControls = res.lookControls;
  const rotateSpeed = 0.03;

  if (lookControls.value.left) playerState.playerRotation.y += rotateSpeed;
  if (lookControls.value.right) playerState.playerRotation.y -= rotateSpeed;
  if (lookControls.value.up) playerState.playerRotation.x += rotateSpeed;
  if (lookControls.value.down) playerState.playerRotation.x -= rotateSpeed;

  playerState.playerRotation.x = Math.max(
    -Math.PI / 2,
    Math.min(Math.PI / 2, playerState.playerRotation.x)
  );
  camera.rotation.copy(playerState.playerRotation);
}

function computeMovement(world: ECSWorld): { dx: number; dz: number } | null {
  const res = world.resources;
  const camera = res.camera;
  const speed = 2.0;

  const frontVector = new Vector3(
    0,
    0,
    Number(res.controls.value.backward) - Number(res.controls.value.forward)
  );
  const sideVector = new Vector3(
    Number(res.controls.value.left) - Number(res.controls.value.right),
    0,
    0
  );

  const direction = new Vector3()
    .subVectors(frontVector, sideVector)
    .normalize()
    .multiplyScalar(speed)
    .applyEuler(new Euler(0, camera.rotation.y, 0));

  return { dx: direction.x, dz: direction.z };
}

function processMovement(world: ECSWorld, _entity: any, _playerState: any, _dt: number) {
  const res = world.resources;
  const camera = res.camera;

  const movement = computeMovement(world);
  if (!movement) return;

  const nextX = camera.position.x + movement.dx;
  const nextZ = camera.position.z + movement.dz;

  if (!checkGridCollision(nextX, nextZ, res.occupiedGrids, 2)) {
    camera.position.x = nextX;
    camera.position.z = nextZ;
  }
}

function enforceCameraBounds(_world: ECSWorld, camera: any) {
  const BOUNDS = 2000;
  if (camera.position.x > BOUNDS) camera.position.x = -BOUNDS;
  if (camera.position.x < -BOUNDS) camera.position.x = BOUNDS;
  if (camera.position.z > BOUNDS) camera.position.z = -BOUNDS;
  if (camera.position.z < -BOUNDS) camera.position.z = BOUNDS;
}

function updateJumpAndBob(
  world: ECSWorld,
  _entity: any,
  playerState: any,
  jumpState: any,
  _dt: number
) {
  const res = world.resources;
  const camera = res.camera;
  const controls = res.controls;
  const currentGroundH = getHeight(camera.position.x, camera.position.z) + 3;

  if (playerState.isJumping) {
    camera.position.y += playerState.velocityY;
    playerState.velocityY -= jumpState.gravity;
    if (camera.position.y <= currentGroundH) {
      camera.position.y = currentGroundH;
      playerState.isJumping = false;
      playerState.velocityY = 0;
    }
  } else if (
    controls.value.forward ||
    controls.value.backward ||
    controls.value.left ||
    controls.value.right
  ) {
    camera.position.y = currentGroundH + Math.sin(Date.now() * 0.01) * 0.1;
  } else {
    camera.position.y = currentGroundH;
  }
}

function checkCarCollisions(world: ECSWorld, camera: any) {
  const res = world.resources;
  const cars = res.cars;
  const hitDistSq = 15 * 15;

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    const distSq = camera.position.distanceToSquared(car.position);

    if (distSq < hitDistSq) {
      if (!car.userData.isPlayerHit) {
        car.userData.isPlayerHit = true;
        carAudio.playCrash();
      }
    } else if (car.userData.isPlayerHit) {
      car.userData.isPlayerHit = false;
    }
  }
}

function updateProximityAndNavigation(world: ECSWorld, entity: any, px: number, pz: number) {
  checkStoryTriggerProximity(world, px, pz);
  updateStoryObjectives(world, entity, px, pz);
}

function checkStoryTriggerProximity(world: ECSWorld, px: number, pz: number) {
  const res = world.resources;

  if (!res.nearStoryTrigger || !res.storyState) return;
  const ss = res.storyState.value;
  if (ss.active || ss.missions.length === 0) {
    res.nearStoryTrigger.value = false;
    return;
  }
  const dx = px - STORY_TRIGGER_POSITION.x;
  const dz = pz - STORY_TRIGGER_POSITION.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  res.nearStoryTrigger.value = dist < 50;
}

function updateStoryObjectives(world: ECSWorld, entity: any, px: number, pz: number) {
  const res = world.resources;

  if (!res.storyState || !res.updateObjective) return;
  const ss = res.storyState.value;
  if (!ss.active || ss.showingBriefing || ss.showingDialogue || ss.missionComplete) return;
  const mission = ss.missions[ss.currentMissionIndex];
  if (!mission) return;

  const now = Date.now();
  if (now - entity.playerState.lastObjectiveProximityCheck < 500) return;
  entity.playerState.lastObjectiveProximityCheck = now;

  for (let i = 0; i < mission.objectives.length; i++) {
    const obj = mission.objectives[i];
    if (obj.completed) continue;
    const dx = px - obj.x;
    const dz = pz - obj.z;
    if (Math.sqrt(dx * dx + dz * dz) < 50) {
      res.updateObjective(ss.currentMissionIndex, i);
      break;
    }
  }
}

function getMinimapObjectives(ss: any) {
  if (!ss.active || !ss.missions[ss.currentMissionIndex]) return [];
  return ss.missions[ss.currentMissionIndex].objectives.map((o: any) => ({
    x: o.x,
    z: o.z,
    completed: o.completed,
    label: o.label,
    type: o.type,
  }));
}

function updateMinimap(world: ECSWorld, px: number, pz: number) {
  const res = world.resources;
  if (!res.minimapData || !res.storyState) return;
  const ss = res.storyState.value;
  const mdata = res.minimapData.value;
  mdata.playerX = px;
  mdata.playerZ = pz;
  mdata.playerRotation = res.camera.rotation.y;
  mdata.objectives = getMinimapObjectives(ss);
  res.minimapData.value = { ...mdata };
}

function advanceStoryFromEvent(world: ECSWorld): boolean {
  const res = world.resources;
  const ss = res.storyState?.value;
  if (ss?.showingBriefing && res.dismissBriefing) {
    res.dismissBriefing();
    return true;
  }
  if (ss?.showingDialogue && res.advanceDialogue) {
    res.advanceDialogue();
    return true;
  }
  return false;
}

function handleStoryInteraction(world: ECSWorld, _entity: any, event: KeyboardEvent) {
  const res = world.resources;
  if (!res.storyState || (event.key !== 'e' && event.key !== 'E')) return;
  if (advanceStoryFromEvent(world)) return;
  if (res.nearStoryTrigger?.value && res.activateStoryTrigger) {
    res.activateStoryTrigger();
  }
}
