import { GameContext, GameMode } from "../types";
import { carAudio } from "../audio/CarAudio";
import { BOUNDS, CELL_SIZE, START_OFFSET } from "../config";
import { STORY_TRIGGER_POSITION } from "../StoryItemsManager";
import { Vector3, Euler, Quaternion } from "three";
import { getHeight } from "../../utils/HeightMap";

export class ExplorationMode implements GameMode {
  context: GameContext | null = null;

  // State
  isTransitioning = false;
  isJumping = false;
  velocityY = 0;
  playerRotation = new Euler(0, 0, 0, "YXZ");

  // Story proximity cooldown
  private lastObjectiveProximityCheck = 0;

  // Constants
  gravity = 0.015;
  jumpStrength = 0.4;

  init(context: GameContext) {
    this.context = context;
    this.isTransitioning = true;
    this.playerRotation.set(0, 0, 0);
    this.velocityY = 0;
    this.isJumping = false;

    if (!context.isMobile.value && context.renderer) {
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
    if (!this.context || !this.context.isMobile.value) return;
    const { camera, lookControls } = this.context;
    const rotateSpeed = 0.03;
    if (lookControls.value.left) this.playerRotation.y += rotateSpeed;
    if (lookControls.value.right) this.playerRotation.y -= rotateSpeed;
    if (lookControls.value.up) this.playerRotation.x += rotateSpeed;
    if (lookControls.value.down) this.playerRotation.x -= rotateSpeed;

    this.playerRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.playerRotation.x));
    camera.rotation.copy(this.playerRotation);
  }

  private computeMovement(): { dx: number; dz: number } | null {
    if (!this.context) return null;
    const { camera, controls } = this.context;
    const speed = 2.0;

    const frontVector = new Vector3(0, 0, Number(controls.value.backward) - Number(controls.value.forward));
    const sideVector = new Vector3(Number(controls.value.left) - Number(controls.value.right), 0, 0);

    const direction = new Vector3()
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(new Euler(0, camera.rotation.y, 0));

    return { dx: direction.x, dz: direction.z };
  }

  private checkGridCollision(nextX: number, nextZ: number): boolean {
    if (!this.context) return false;
    const { occupiedGrids } = this.context;
    const ix = Math.round((nextX - START_OFFSET) / CELL_SIZE);
    const iz = Math.round((nextZ - START_OFFSET) / CELL_SIZE);

    if (!occupiedGrids.has(`${ix},${iz}`)) return false;

    const cX = START_OFFSET + ix * CELL_SIZE;
    const cZ = START_OFFSET + iz * CELL_SIZE;
    const dims = occupiedGrids.get(`${ix},${iz}`);
    return dims
      ? Math.abs(nextX - cX) < dims.halfW + 2 && Math.abs(nextZ - cZ) < dims.halfD + 2
      : false;
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
    const { camera, controls } = this.context;
    const currentGroundH = getHeight(camera.position.x, camera.position.z) + 3;

    if (this.isJumping) {
      camera.position.y += this.velocityY;
      this.velocityY -= this.gravity;
      if (camera.position.y <= currentGroundH) {
        camera.position.y = currentGroundH;
        this.isJumping = false;
        this.velocityY = 0;
      }
    } else if (controls.value.forward || controls.value.backward || controls.value.left || controls.value.right) {
      camera.position.y = currentGroundH + Math.sin(Date.now() * 0.01) * 0.1;
    } else {
      camera.position.y = currentGroundH;
    }
  }

  private checkCarCollisions() {
    if (!this.context) return;
    const { camera, cars } = this.context;
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

    const movement = this.computeMovement();
    if (movement) {
      const nextX = camera.position.x + movement.dx;
      const nextZ = camera.position.z + movement.dz;

      if (!this.checkGridCollision(nextX, nextZ)) {
        camera.position.x = nextX;
        camera.position.z = nextZ;
      }
    }

    this.enforceCameraBounds();
    this.updateJumpAndBob();
    this.checkCarCollisions();
    this.checkStoryTriggerProximity(camera.position.x, camera.position.z);
    this.updateStoryObjectives(camera.position.x, camera.position.z);
    this.updateMinimap(camera.position.x, camera.position.z);
  }

  private canCheckObjective(ctx: any, ss: any): boolean {
    if (!ctx?.updateObjective || !ctx?.storyState) return false;
    if (!ss?.active || ss.showingBriefing || ss.showingDialogue || ss.missionComplete) return false;
    return true;
  }

  private checkStoryTriggerProximity(px: number, pz: number) {
    const ctx = this.context;
    if (!ctx?.nearStoryTrigger || !ctx?.storyState) return;
    const ss = ctx.storyState.value;
    if (ss.active || ss.missions.length === 0) {
      ctx.nearStoryTrigger.value = false;
      return;
    }
    const dx = px - STORY_TRIGGER_POSITION.x;
    const dz = pz - STORY_TRIGGER_POSITION.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    ctx.nearStoryTrigger.value = dist < 50;
  }

  private updateStoryObjectives(px: number, pz: number) {
    const ctx = this.context;
    const ss = ctx?.storyState?.value;
    if (!this.canCheckObjective(ctx, ss)) return;
    const mission = ss.missions[ss.currentMissionIndex];
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
        ctx.updateObjective(ss.currentMissionIndex, i);
        break;
      }
    }
  }

  private updateMinimap(px: number, pz: number) {
    const ctx = this.context;
    if (!ctx || !ctx.minimapData || !ctx.storyState) return;
    const ss = ctx.storyState.value;
    const mdata = ctx.minimapData.value;
    mdata.playerX = px;
    mdata.playerZ = pz;
    mdata.playerRotation = ctx.camera.rotation.y;
    mdata.currentMissionId = ss.active && !ss.missionComplete
      ? ss.missions[ss.currentMissionIndex]?.id ?? ""
      : "";
    const objs: { x: number; z: number; completed: boolean; label: string; type: string }[] = [];
    if (ss.active && ss.missions[ss.currentMissionIndex]) {
      for (const o of ss.missions[ss.currentMissionIndex].objectives) {
        objs.push({ x: o.x, z: o.z, completed: o.completed, label: o.label, type: o.type });
      }
    }
    mdata.objectives = objs;
    ctx.minimapData.value = { ...mdata };
  }

  cleanup() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  private handleStoryInteraction(event: KeyboardEvent) {
    if (!this.context || (event.key !== "e" && event.key !== "E")) return;
    const ss = this.context.storyState?.value;
    if (ss?.showingBriefing && this.context.dismissBriefing) {
      this.context.dismissBriefing();
    } else if (ss?.showingDialogue && this.context.advanceDialogue) {
      this.context.advanceDialogue();
    } else if (this.context.nearStoryTrigger?.value && this.context.activateStoryTrigger) {
      this.context.activateStoryTrigger();
    }
  }

  private handleControlsKey(event: KeyboardEvent) {
    if (!this.context) return;
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

  onKeyDown(event: KeyboardEvent) {
    if (!this.context) return;

    if (event.code === "Space" && !this.isJumping) {
      this.isJumping = true;
      this.velocityY = this.jumpStrength;
    }

    this.handleStoryInteraction(event);
    this.handleControlsKey(event);
  }

  onKeyUp(event: KeyboardEvent) {
    if (!this.context) return;
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

  onClick(_event: MouseEvent) {
    if (!this.context) return;
    if (this.context.storyState?.value.showingDialogue) {
      if (this.context.advanceDialogue) {
        this.context.advanceDialogue();
        return;
      }
    }
    if (this.context.storyState?.value.showingBriefing) {
      if (this.context.dismissBriefing) {
        this.context.dismissBriefing();
        return;
      }
    }
    if (!this.context.isMobile.value) {
      if (document.pointerLockElement !== document.body) {
        document.body.requestPointerLock();
      }
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.context) return;
    if (this.context.isMobile.value) return;
    if (document.pointerLockElement !== document.body) return;

    const sensitivity = 0.002;
    this.playerRotation.y -= event.movementX * sensitivity;
    this.playerRotation.x -= event.movementY * sensitivity;

    this.playerRotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.playerRotation.x),
    );
    this.context.camera.rotation.copy(this.playerRotation);
  }
}
