import { GameContext, GameMode, StoryObjective, StoryState } from '../types';
import { carAudio } from '../audio/CarAudio';
import { BOUNDS } from '../config';
import { STORY_TRIGGER_POSITION } from '../StoryItemsManager';
import { Vector3, Euler, Quaternion } from 'three';
import { getHeight } from '../../utils/HeightMap';
import { handleControlsKeyDown, handleControlsKeyUp } from '../../utils/controls';
import { checkGridCollision } from '../../utils/GridCollision';

export class ExplorationMode implements GameMode {
  context: GameContext | null = null;

  isTransitioning = false;
  isJumping = false;
  velocityY = 0;
  playerRotation = new Euler(0, 0, 0, 'YXZ');
  private lastObjectiveProximityCheck = 0;
  gravity = 0.015;
  jumpStrength = 0.4;

  init(context: GameContext) {
    this.context = context;
    this.isTransitioning = true;
    this.playerRotation.set(0, 0, 0);
    this.velocityY = 0;
    this.isJumping = false;

    if (!context.gameState.isMobile && context.renderer) {
      document.body.requestPointerLock();
    }
  }

  private handleTransition() {
    if (!this.context || !this.isTransitioning) return false;
    const { camera } = this.context;
    const targetPos = new Vector3(0, 3, 0);
    const targetQ = new Quaternion().setFromEuler(this.playerRotation);

    camera.position.lerp(targetPos, 0.05);
    camera.quaternion.slerp(targetQ, 0.05);

    if (camera.position.distanceTo(targetPos) < 1) {
      this.isTransitioning = false;
      camera.position.copy(targetPos);
      camera.rotation.copy(this.playerRotation);
    }
    return true;
  }

  private handleMobileLook() {
    if (!this.context || !this.context.gameState.isMobile) return;
    const { camera } = this.context;
    const { lookControls } = this.context.gameState;
    const rotateSpeed = 0.03;
    if (lookControls.left) this.playerRotation.y += rotateSpeed;
    if (lookControls.right) this.playerRotation.y -= rotateSpeed;
    if (lookControls.up) this.playerRotation.x += rotateSpeed;
    if (lookControls.down) this.playerRotation.x -= rotateSpeed;

    this.playerRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.playerRotation.x));
    camera.rotation.copy(this.playerRotation);
  }

  private computeMovement(): { dx: number; dz: number } | null {
    if (!this.context) return null;
    const { camera } = this.context;
    const { controls } = this.context.gameState;
    const speed = 2.0;

    const frontVector = new Vector3(
      0,
      0,
      Number(controls.backward) - Number(controls.forward)
    );
    const sideVector = new Vector3(
      Number(controls.left) - Number(controls.right),
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

  private checkGridCollision(nextX: number, nextZ: number): boolean {
    if (!this.context) return false;
    return checkGridCollision(nextX, nextZ, this.context.gameState.occupiedGrids, 2);
  }

  private enforceCameraBounds() {
    if (!this.context) return;
    const { camera } = this.context;
    if (camera.position.x > BOUNDS) camera.position.x = -BOUNDS;
    if (camera.position.x < -BOUNDS) camera.position.x = BOUNDS;
    if (camera.position.z > BOUNDS) camera.position.z = -BOUNDS;
    if (camera.position.z < -BOUNDS) camera.position.z = BOUNDS;
  }

  private updateJumpAndBob() {
    if (!this.context) return;
    const { camera } = this.context;
    const { controls } = this.context.gameState;
    const currentGroundH = getHeight(camera.position.x, camera.position.z) + 3;

    if (this.isJumping) {
      camera.position.y += this.velocityY;
      this.velocityY -= this.gravity;
      if (camera.position.y <= currentGroundH) {
        camera.position.y = currentGroundH;
        this.isJumping = false;
        this.velocityY = 0;
      }
    } else if (
      controls.forward ||
      controls.backward ||
      controls.left ||
      controls.right
    ) {
      camera.position.y = currentGroundH + Math.sin(Date.now() * 0.01) * 0.1;
    } else {
      camera.position.y = currentGroundH;
    }
  }

  private checkCarCollisions() {
    if (!this.context) return;
    const { camera } = this.context;
    const { cars } = this.context;
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

  update(_dt: number, _time: number) {
    if (!this.context) return;
    const { camera } = this.context;

    if (this.handleTransition()) return;

    this.handleMobileLook();

    this.processMovement();

    this.enforceCameraBounds();
    this.updateJumpAndBob();
    this.checkCarCollisions();
    this.updateProximityAndNavigation(camera.position.x, camera.position.z);
    this.updateMinimap(camera.position.x, camera.position.z);
  }

  private processMovement() {
    if (!this.context) return;
    const { camera } = this.context;
    const movement = this.computeMovement();
    if (!movement) return;
    const nextX = camera.position.x + movement.dx;
    const nextZ = camera.position.z + movement.dz;
    if (!this.checkGridCollision(nextX, nextZ)) {
      camera.position.x = nextX;
      camera.position.z = nextZ;
    }
  }

  private updateProximityAndNavigation(px: number, pz: number) {
    this.checkStoryTriggerProximity(px, pz);
    this.updateStoryObjectives(px, pz);
  }

  private canCheckObjective(
    ctx: GameContext | null | undefined,
    ss: StoryState | undefined
  ): boolean {
    if (!ctx?.updateObjective) return false;
    if (!ss?.active || ss.showingBriefing || ss.showingDialogue || ss.missionComplete) return false;
    return true;
  }

  private checkStoryTriggerProximity(px: number, pz: number) {
    const ctx = this.context;
    if (!ctx || !ctx.gameState.nearStoryTrigger || !ctx.gameState.storyState) return;
    const ss = ctx.gameState.storyState;
    if (ss.active || ss.missions.length === 0) {
      ctx.gameState.nearStoryTrigger = false;
      return;
    }
    const dx = px - STORY_TRIGGER_POSITION.x;
    const dz = pz - STORY_TRIGGER_POSITION.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    ctx.gameState.nearStoryTrigger = dist < 50;
  }

  private updateStoryObjectives(px: number, pz: number) {
    const ctx = this.context;
    const ss = ctx?.gameState.storyState;
    if (!this.canCheckObjective(ctx, ss)) return;
    const mission = ss!.missions[ss!.currentMissionIndex];
    if (!mission) return;
    const now = Date.now();
    if (now - this.lastObjectiveProximityCheck < 500) return;
    this.lastObjectiveProximityCheck = now;
    for (let i = 0; i < mission.objectives.length; i++) {
      const obj = mission.objectives[i];
      if (obj.completed) continue;
      const dx = px - obj.x;
      const dz = pz - obj.z;
      if (Math.sqrt(dx * dx + dz * dz) < 50) {
        ctx!.updateObjective!(ss!.currentMissionIndex, i);
        break;
      }
    }
  }

  private getMinimapObjectives(ss: StoryState) {
    if (!ss.active || !ss.missions[ss.currentMissionIndex]) return [];
    return ss.missions[ss.currentMissionIndex].objectives.map((o: StoryObjective) => ({
      x: o.x,
      z: o.z,
      completed: o.completed,
      label: o.label,
      type: o.type,
    }));
  }

  private updateMinimap(px: number, pz: number) {
    const ctx = this.context;
    if (!ctx || !ctx.gameState.minimapData || !ctx.gameState.storyState) return;
    const ss = ctx.gameState.storyState;
    const mdata = ctx.gameState.minimapData;
    mdata.playerX = px;
    mdata.playerZ = pz;
    mdata.playerRotation = ctx.camera.rotation.y;
    mdata.objectives = this.getMinimapObjectives(ss);
  }

  cleanup() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  private advanceStoryFromEvent() {
    if (!this.context) return false;
    const ss = this.context.gameState.storyState;
    if (ss?.showingBriefing && this.context.dismissBriefing) {
      this.context.dismissBriefing();
      return true;
    }
    if (ss?.showingDialogue && this.context.advanceDialogue) {
      this.context.advanceDialogue();
      return true;
    }
    return false;
  }

  private handleStoryInteraction(event: KeyboardEvent) {
    if (!this.context || (event.key !== 'e' && event.key !== 'E')) return;
    if (this.advanceStoryFromEvent()) return;
    if (this.context.gameState.nearStoryTrigger && this.context.activateStoryTrigger) {
      this.context.activateStoryTrigger();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.context) return;

    if (event.code === 'Space' && !this.isJumping) {
      this.isJumping = true;
      this.velocityY = this.jumpStrength;
    }

    this.handleStoryInteraction(event);
    handleControlsKeyDown(this.context.gameState.controls, event);
  }

  onKeyUp(event: KeyboardEvent) {
    if (!this.context) return;
    handleControlsKeyUp(this.context.gameState.controls, event);
  }

  onClick(_event: MouseEvent) {
    if (!this.context) return;
    if (this.advanceStoryFromEvent()) return;
    if (!this.context.gameState.isMobile && document.pointerLockElement !== document.body) {
      document.body.requestPointerLock();
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.context) return;
    if (this.context.gameState.isMobile) return;
    if (document.pointerLockElement !== document.body) return;

    const sensitivity = 0.002;
    this.playerRotation.y -= event.movementX * sensitivity;
    this.playerRotation.x -= event.movementY * sensitivity;

    this.playerRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.playerRotation.x));
    this.context.camera.rotation.copy(this.playerRotation);
  }
}