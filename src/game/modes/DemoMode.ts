import { GameMode, GameContext } from "../types";
import { Vector3, MathUtils, Mesh, Object3D, BoxGeometry } from "three";
import { cyberpunkAudio } from "../../utils/CyberpunkAudio";
import { audioManager } from "../../utils/AudioManager";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";

interface BloomPass {
  strength: number;
  radius: number;
  threshold: number;
}

function isBloomPass(pass: unknown): pass is BloomPass {
  return (
    typeof pass === "object" &&
    pass !== null &&
    "strength" in pass &&
    "radius" in pass &&
    "threshold" in pass
  );
}

const BEAT = 60 / 135; // seconds per beat @ 135 BPM (~0.444s)
// 4 bars per scene
const SCENE_DURATION = BEAT * 16; // 16 beats per scene (~7.111s)
const TOTAL_SCENES = 4;
const TRANSITION_DURATION = 0.9;

export class DemoMode implements GameMode {
  private context!: GameContext;

  // Scene sequencing
  private sceneIndex: number = 0;
  private sceneTime: number = 0;

  // Post-processing references
  private originalBloomStrength: number = 1.5;
  private bloomPass: BloomPass | null = null;
  private afterimagePass: AfterimagePass | null = null;
  private glitchPass: GlitchPass | null = null;

  // Camera state
  private cameraBasePosition: Vector3 = new Vector3();
  private cameraShake: Vector3 = new Vector3();
  private currentLookTarget: Vector3 = new Vector3(0, 0, 0);
  private cameraRoll: number = 0;

  // Transition blending
  private transitioning: boolean = false;
  private transitionProgress: number = 1;
  private transitionFromPos: Vector3 = new Vector3();
  private transitionFromTarget: Vector3 = new Vector3();
  private _blendPos: Vector3 = new Vector3();
  private _blendTarget: Vector3 = new Vector3();

  // Spark emission points
  private sparkTargets: Vector3[] = [];

  // Per-scene accumulators
  private streetDist: number = 0;

  private onAudioNoteBound = (type: string, data?: number) =>
    this.onAudioNote(type, data);

  // ----- Lifecycle -----------------------------------------------------------

  init(context: GameContext): void {
    this.context = context;

    if (this.context.composer?.passes) {
      const passes = this.context.composer.passes as unknown[];
      for (const pass of passes) {
        if (isBloomPass(pass)) {
          this.bloomPass = pass;
          break;
        }
      }
      if (!this.bloomPass && passes.length > 1) {
        const pass = passes[1];
        if (isBloomPass(pass)) this.bloomPass = pass;
      }
      if (this.bloomPass) {
        this.originalBloomStrength = this.bloomPass.strength;
      }

      this.afterimagePass = new AfterimagePass();
      this.afterimagePass.uniforms["damp"].value = 0.8;
      this.afterimagePass.enabled = false;
      this.context.composer.addPass(this.afterimagePass);

      this.glitchPass = new GlitchPass();
      this.glitchPass.goWild = false;
      this.glitchPass.enabled = false;
      this.context.composer.addPass(this.glitchPass);
    }

    this.identifySparkTargets();

    cyberpunkAudio.addListener(this.onAudioNoteBound);
    cyberpunkAudio.play();

    this.sceneIndex = 0;
    this.sceneTime = 0;
    this.transitioning = false;
    this.transitionProgress = 1;

    this.setSceneDefaults(0);
    this.applyCamera();
  }

  update(dt: number, time: number): void {
    this.sceneTime += dt;

    if (this.sceneTime > SCENE_DURATION) {
      this.sceneTime = 0;
      const next = (this.sceneIndex + 1) % TOTAL_SCENES;
      this.beginTransition(next);
      this.sceneIndex = next;
      this.setSceneDefaults(this.sceneIndex);
    }

    this.updateScene(dt, time);

    // ---- Camera ---------------------------------------------------------
    if (this.transitioning) {
      this.transitionProgress = Math.min(
        1,
        this.transitionProgress + dt / TRANSITION_DURATION,
      );
      const t = this.smoothstep(this.transitionProgress);

      this._blendPos.lerpVectors(
        this.transitionFromPos,
        this.cameraBasePosition,
        t,
      );
      this.context.camera.position.copy(this._blendPos).add(this.cameraShake);

      this._blendTarget.lerpVectors(
        this.transitionFromTarget,
        this.currentLookTarget,
        t,
      );
      this.context.camera.lookAt(this._blendTarget);

      if (this.transitionProgress >= 1) this.transitioning = false;
    } else {
      this.context.camera.position
        .copy(this.cameraBasePosition)
        .add(this.cameraShake);
      this.context.camera.lookAt(this.currentLookTarget);
    }

    if (this.cameraRoll !== 0) {
      this.context.camera.rotation.z = this.cameraRoll;
    }

    // ---- Effects decay --------------------------------------------------
    this.cameraShake.lerp(new Vector3(0, 0, 0), dt * 6);

    if (this.bloomPass) {
      this.bloomPass.strength = MathUtils.lerp(
        this.bloomPass.strength,
        this.originalBloomStrength,
        dt * 4,
      );
    }

    if (this.glitchPass?.enabled && Math.random() > 0.95) {
      this.glitchPass.enabled = false;
    }
  }

  cleanup(): void {
    cyberpunkAudio.removeListener(this.onAudioNoteBound);
    if (!audioManager.isSoundEnabled.value) cyberpunkAudio.dispose();
    else cyberpunkAudio.pause();

    if (this.bloomPass) this.bloomPass.strength = this.originalBloomStrength;

    if (this.context.composer) {
      if (this.afterimagePass)
        this.context.composer.removePass(this.afterimagePass);
      if (this.glitchPass) this.context.composer.removePass(this.glitchPass);
    }
  }

  onKeyDown(_event: KeyboardEvent): void {}
  onKeyUp(_event: KeyboardEvent): void {}
  onClick(_event: MouseEvent): void {}
  onMouseMove(_event: MouseEvent): void {}

  // ==========================================================================
  //  AUDIO REACTIVITY
  // ==========================================================================

  private onAudioNote(type: string, _data?: number) {
    if (type === "kick") {
      if (this.bloomPass) this.bloomPass.strength = 3.0;
      this.cameraShake.y += (Math.random() - 0.5) * 6;
      if (this.glitchPass && Math.random() < 0.3)
        this.glitchPass.enabled = true;
    }

    if (type === "snare") {
      if (this.bloomPass) this.bloomPass.strength = 2.5;
      this.cameraShake.x += (Math.random() - 0.5) * 5;

      if (this.sparkTargets.length > 0) {
        for (let k = 0; k < 3; k++) {
          const target =
            this.sparkTargets[
              Math.floor(Math.random() * this.sparkTargets.length)
            ];
          for (let i = 0; i < 5; i++) {
            this.context.spawnSparks(target.clone());
          }
        }
      }
    }

    if (type === "hihat") {
      this.cameraShake.z += (Math.random() - 0.5) * 2;
    }
  }

  // ==========================================================================
  //  SCENE SEQUENCING
  // ==========================================================================

  private updateScene(dt: number, time: number) {
    switch (this.sceneIndex) {
      case 0:
        this.updateSceneGenesis(dt, time);
        break;
      case 1:
        this.updateSceneVelocity(dt, time);
        break;
      case 2:
        this.updateSceneVortex(dt, time);
        break;
      case 3:
        this.updateSceneSynthesis(dt, time);
        break;
    }
  }

  private setSceneDefaults(index: number) {
    const cam = this.context.camera;
    cam.rotation.set(0, 0, 0);
    this.cameraRoll = 0;

    switch (index) {
      case 0:
        this.cameraBasePosition.set(0, 800, 1200);
        this.currentLookTarget.set(0, 0, 0);
        break;
      case 1:
        this.cameraBasePosition.set(0, 30, 2000);
        this.currentLookTarget.set(0, 20, 1900);
        this.streetDist = 0;
        break;
      case 2:
        this.cameraBasePosition.set(800, 600, 0);
        this.currentLookTarget.set(0, 0, 0);
        break;
      case 3:
        this.cameraBasePosition.set(0, 150, 450);
        this.currentLookTarget.set(0, 200, 0);
        break;
    }
    cam.position.copy(this.cameraBasePosition);
    cam.lookAt(this.currentLookTarget);
  }

  private beginTransition(_nextIndex: number) {
    this.transitionFromPos.copy(this.context.camera.position);
    this.transitionFromTarget.copy(this.currentLookTarget);
    this.transitioning = true;
    this.transitionProgress = 0;
  }

  private applyCamera() {
    this.context.camera.position
      .copy(this.cameraBasePosition)
      .add(this.cameraShake);
    this.context.camera.lookAt(this.currentLookTarget);
  }

  private smoothstep(t: number): number {
    return t * t * (3 - 2 * t);
  }

  // ==========================================================================
  //  SCENE 0 — GENESIS  (bars 1-4)
  //  Slow reveal: camera glides in from high above the city
  // ==========================================================================

  private updateSceneGenesis(_dt: number, time: number) {
    const progress = this.sceneTime / SCENE_DURATION;

    this.cameraBasePosition.x = Math.sin(time * 0.25) * 40;
    this.cameraBasePosition.y = 800 - progress * 500;
    this.cameraBasePosition.z = 1200 - progress * 900;

    this.currentLookTarget.set(0, 0, 0);

    if (this.afterimagePass) this.afterimagePass.enabled = false;
  }

  // ==========================================================================
  //  SCENE 1 — VELOCITY (bars 5-8)
  //  High-speed rooftop chase skimming above the city
  // ==========================================================================

  private updateSceneVelocity(dt: number, time: number) {
    const speed = 800 + Math.sin(time * 2) * 100;

    this.cameraBasePosition.z -= speed * dt;
    this.streetDist += speed * dt;

    // Fly above building bodies (40-160 tall) — skim the rooftops
    const weaveAmp = 120 + Math.sin(time * 1.2) * 40;
    this.cameraBasePosition.x =
      Math.sin(this.streetDist * 0.004 + time * 0.5) * weaveAmp;

    this.cameraBasePosition.y = 220 + Math.sin(time * 2.5) * 20;

    const lookDist = 350;
    const lookX =
      Math.sin((this.streetDist + lookDist * 2) * 0.004 + (time + 0.3) * 0.5) *
      weaveAmp *
      0.6;
    this.currentLookTarget.set(
      lookX,
      100,
      this.cameraBasePosition.z - lookDist,
    );

    if (this.cameraBasePosition.z < -2000) {
      this.cameraBasePosition.z = 2000;
      this.cameraBasePosition.x = (Math.random() - 0.5) * 300;
      this.streetDist = 0;
    }

    if (this.afterimagePass) {
      this.afterimagePass.enabled = true;
      this.afterimagePass.uniforms["damp"].value = 0.82;
    }
  }

  // ==========================================================================
  //  SCENE 2 — VORTEX   (bars 9-12)
  //  Descending spiral around the city core
  // ==========================================================================

  private updateSceneVortex(_dt: number, time: number) {
    const progress = this.sceneTime / SCENE_DURATION;

    const startR = 900;
    const endR = 150;
    const radius = startR + (endR - startR) * progress;
    const angle = time * 0.5;

    this.cameraBasePosition.x = Math.sin(angle) * radius;
    this.cameraBasePosition.z = Math.cos(angle) * radius;
    this.cameraBasePosition.y =
      550 - progress * 400 + Math.sin(time * 1.8) * 40;

    this.currentLookTarget.set(0, 0, 0);

    if (this.afterimagePass) {
      this.afterimagePass.enabled = true;
      this.afterimagePass.uniforms["damp"].value = 0.72;
    }
  }

  // ==========================================================================
  //  SCENE 3 — CROWN    (bars 13-16)
  //  Cinematic pull-back orbit — a grand reveal of the city
  // ==========================================================================

  private updateSceneSynthesis(_dt: number, time: number) {
    const progress = this.sceneTime / SCENE_DURATION;

    const radius = 450 + progress * 350;
    const height = 150 + progress * 200;
    const angle = time * 0.3;

    this.cameraBasePosition.x = Math.sin(angle) * radius;
    this.cameraBasePosition.z = Math.cos(angle) * radius;
    this.cameraBasePosition.y = height + Math.sin(time * 0.6) * 15;

    this.currentLookTarget.set(0, 200 - progress * 100, 0);
    this.cameraRoll = 0;

    if (this.afterimagePass) {
      this.afterimagePass.enabled = true;
      this.afterimagePass.uniforms["damp"].value = 0.75;
    }

    if (this.glitchPass) this.glitchPass.enabled = false;
  }

  // ==========================================================================
  //  SPARK TARGET IDENTIFICATION
  // ==========================================================================

  private getMeshTopPoint(child: Mesh, worldPos: Vector3): number {
    let topY = worldPos.y;
    const geo = child.geometry as BoxGeometry;
    if (geo?.parameters?.height) {
      topY += (geo.parameters.height * child.scale.y) / 2;
    } else if (child.geometry && child.geometry.boundingBox) {
      topY = child.geometry.boundingBox.max.y * child.scale.y + worldPos.y;
    }
    return topY;
  }

  private isSpire(child: Mesh): boolean {
    return !!(
      child.geometry &&
      (child.geometry.type === "ConeGeometry" ||
        child.geometry.constructor.name === "ConeGeometry")
    );
  }

  private isAntenna(child: Mesh): boolean {
    return !!(
      child.geometry &&
      child.geometry.type === "BoxGeometry" &&
      child.scale.x < 5 &&
      child.scale.z < 5 &&
      child.scale.y > 20
    );
  }

  private getBuildingHighestPoint(
    buildingGroup: Object3D,
  ): { point: Vector3; maxY: number } | null {
    const highestPoint = new Vector3();
    let maxY = -Infinity;
    let foundSpire = false;

    buildingGroup.traverse((child: Object3D) => {
      if (!(child instanceof Mesh)) return;
      const worldPos = new Vector3();
      child.getWorldPosition(worldPos);
      const topY = this.getMeshTopPoint(child, worldPos);
      const isImportant = this.isSpire(child) || this.isAntenna(child);

      if (isImportant) {
        if (topY > maxY) {
          maxY = topY;
          highestPoint.copy(worldPos);
          highestPoint.y = topY;
          foundSpire = true;
        }
      } else if (!foundSpire && topY > maxY) {
        maxY = topY;
        highestPoint.copy(worldPos);
        highestPoint.y = topY;
      }
    });

    return maxY > 100 ? { point: highestPoint.clone(), maxY } : null;
  }

  private identifySparkTargets() {
    this.sparkTargets = [];
    if (!this.context.buildings) return;

    for (const building of this.context.buildings) {
      const result = this.getBuildingHighestPoint(building);
      if (result) {
        this.sparkTargets.push(result.point);
      }
    }

    if (this.sparkTargets.length === 0) {
      for (let i = 0; i < 20; i++) {
        this.sparkTargets.push(
          new Vector3(
            (Math.random() - 0.5) * 2000,
            300 + Math.random() * 200,
            (Math.random() - 0.5) * 2000,
          ),
        );
      }
    }
  }
}
