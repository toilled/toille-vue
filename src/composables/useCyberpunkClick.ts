import {
  Raycaster,
  Vector2,
  Vector3,
  type PerspectiveCamera,
  type Object3D,
  Group,
  Mesh,
} from 'three';
import { DrivingMode } from '../game/modes/DrivingMode';
import { GameModeManager } from '../game/GameModeManager';
import { ScoreService } from '../utils/ScoreService';
import type { Ref } from 'vue';

export type GangWarManagerLike = {
  fightMarkers: Object3D[];
};

export interface CyberpunkClickContext {
  camera: PerspectiveCamera;
  scene: Object3D;
  cars: Group[];
  gangWarManager: GangWarManagerLike;
  gameModeManager: GameModeManager;
  leaderboardMeshes: Mesh[];
  isGameMode: Ref<boolean>;
  isDrivingMode: Ref<boolean>;
  isCinematicMode: Ref<boolean>;
  cinematicTarget: Vector3;
  emit: (event: string, ...args: unknown[]) => void;
  gameSessionId: Ref<string | null>;
  activeCar: Ref<Group | null>;
}

export function useCyberpunkClick(ctx: CyberpunkClickContext) {
  const raycaster = new Raycaster();
  const pointer = new Vector2();

  function collectCarMeshes(): Object3D[] {
    const meshes: Object3D[] = [];
    ctx.cars.forEach((c) =>
      c.traverse((child) => {
        if (child instanceof Mesh) meshes.push(child);
      })
    );
    return meshes;
  }

  function handleFightMarkerClick(): boolean {
    if (!ctx.gangWarManager || ctx.gangWarManager.fightMarkers.length === 0) return false;
    const intersects = raycaster.intersectObjects(ctx.gangWarManager.fightMarkers);
    if (intersects.length === 0) return false;
    const hit = intersects[0].object;
    if (hit.userData.isFightMarker && hit.userData.target) {
      ctx.isCinematicMode.value = true;
      ctx.isGameMode.value = true;
      ctx.cinematicTarget.copy(hit.userData.target);
      ctx.emit('game-start');
      return true;
    }
    return false;
  }

  function handleCarClick(): boolean {
    const carMeshes = collectCarMeshes();
    const intersects = raycaster.intersectObjects(carMeshes);
    if (intersects.length === 0) return false;
    const hit = intersects[0].object;
    let target: Object3D = hit;
    while (target.parent && target.parent.type !== 'Scene') {
      target = target.parent;
    }
    if (target instanceof Group && target.userData.speed !== undefined) {
      ctx.activeCar.value = target;
      target.userData.isPlayerControlled = true;
      target.userData.currentSpeed = target.userData.speed;
      ScoreService.createSession()
        .then((id) => {
          ctx.gameSessionId.value = id;
        })
        .catch(() => {});
      ctx.gameModeManager.setMode(new DrivingMode(), 'driving');
      return true;
    }
    return false;
  }

  function handleLeaderboardClick(): boolean {
    if (ctx.leaderboardMeshes.length === 0) return false;
    const intersects = raycaster.intersectObjects(ctx.leaderboardMeshes);
    if (intersects.length === 0) return false;
    return true;
  }

  function handleClick(event: MouseEvent): {
    hitFight: boolean;
    hitCar: boolean;
    hitLeaderboard: boolean;
  } {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, ctx.camera);

    const hitFight = handleFightMarkerClick();
    if (hitFight) return { hitFight: true, hitCar: false, hitLeaderboard: false };
    const hitCar = handleCarClick();
    if (hitCar) return { hitFight: false, hitCar: true, hitLeaderboard: false };
    const hitLeaderboard = handleLeaderboardClick();
    return { hitFight: false, hitCar: false, hitLeaderboard: hitLeaderboard };
  }

  return {
    raycaster,
    pointer,
    handleClick,
    collectCarMeshes,
    handleFightMarkerClick,
    handleCarClick,
    handleLeaderboardClick,
  };
}
