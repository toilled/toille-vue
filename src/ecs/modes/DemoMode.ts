import { GameModeComponent } from '../systems/GameModeSystem';
import { ECSWorld } from '../types';
import { Vector3, MathUtils, Mesh, Object3D, BoxGeometry } from 'three';
import { cyberpunkAudio } from '../../utils/CyberpunkAudio';
import { audioManager } from '../../utils/AudioManager';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';

interface BloomPass {
  strength: number;
  radius: number;
  threshold: number;
}

function isBloomPass(pass: unknown): pass is BloomPass {
  return (
    typeof pass === 'object' &&
    pass !== null &&
    'strength' in pass &&
    'radius' in pass &&
    'threshold' in pass
  );
}

const BEAT = 60 / 135;
const SCENE_DURATION = BEAT * 16;
const TOTAL_SCENES = 4;
const TRANSITION_DURATION = 0.9;

export const demoModeComponent: GameModeComponent = {
  type: 'demo',
  init: (world: ECSWorld, entity: any) => {
    const res = world.resources;
    const composer = res.composer;

    entity.demoState = {
      sceneIndex: 0,
      sceneTime: 0,
      transitioning: false,
      transitionProgress: 1,
      transitionFromPos: new Vector3(),
      transitionFromTarget: new Vector3(),
      cameraBasePosition: new Vector3(),
      cameraShake: new Vector3(),
      currentLookTarget: new Vector3(0, 0, 0),
      cameraRoll: 0,
      streetDist: 0,
      soundWasEnabled: audioManager.isSoundEnabled.value,
      sparkTargets: [],
    };

    entity.postProcessing = {
      bloomPass: null,
      afterimagePass: null,
      glitchPass: null,
      originalBloomStrength: 1.5,
    };

    if (composer?.passes) {
      const passes = composer.passes as unknown[];
      for (const pass of passes) {
        if (isBloomPass(pass)) {
          entity.postProcessing.bloomPass = pass;
          break;
        }
      }
      if (!entity.postProcessing.bloomPass && passes.length > 1) {
        const pass = passes[1];
        if (isBloomPass(pass)) entity.postProcessing.bloomPass = pass;
      }
      if (entity.postProcessing.bloomPass) {
        entity.postProcessing.originalBloomStrength = entity.postProcessing.bloomPass.strength;
      }

      entity.postProcessing.afterimagePass = new AfterimagePass();
      entity.postProcessing.afterimagePass.uniforms['damp'].value = 0.8;
      entity.postProcessing.afterimagePass.enabled = false;
      composer.addPass(entity.postProcessing.afterimagePass);

      entity.postProcessing.glitchPass = new GlitchPass();
      entity.postProcessing.glitchPass.goWild = false;
      entity.postProcessing.glitchPass.enabled = false;
      composer.addPass(entity.postProcessing.glitchPass);
    }

    identifySparkTargets(world, entity);

    entity.onAudioNoteBound = (type: string, data?: number) => {
      onAudioNote(entity, type, data);
    };
    cyberpunkAudio.addListener(entity.onAudioNoteBound);
    cyberpunkAudio.play();

    entity.demoState.sceneIndex = 0;
    entity.demoState.sceneTime = 0;
    entity.demoState.transitioning = false;
    entity.demoState.transitionProgress = 1;

    setSceneDefaults(world, entity, 0);
    applyCamera(world, entity);
  },

  update: (world: ECSWorld, entity: any, dt: number, time: number) => {
    const demoState = entity.demoState;

    demoState.sceneTime += dt;

    if (demoState.sceneTime > SCENE_DURATION) {
      advanceToNextScene(world, entity);
    }

    updateScene(world, entity, dt, time);
    updateCamera(world, entity, dt);
    decayEffects(entity, dt);
  },

  cleanup: (world: ECSWorld, entity: any) => {
    const res = world.resources;
    const composer = res.composer;
    const postProcessing = entity.postProcessing;

    cyberpunkAudio.removeListener(entity.onAudioNoteBound);
    if (!entity.demoState.soundWasEnabled) cyberpunkAudio.pause();

    if (postProcessing.bloomPass)
      postProcessing.bloomPass.strength = postProcessing.originalBloomStrength;

    if (composer) {
      if (postProcessing.afterimagePass) composer.removePass(postProcessing.afterimagePass);
      if (postProcessing.glitchPass) composer.removePass(postProcessing.glitchPass);
    }
  },
};

function identifySparkTargets(world: ECSWorld, entity: any) {
  const res = world.resources;
  const demoState = entity.demoState;

  demoState.sparkTargets = [];

  if (!res.buildings) return;

  for (const building of res.buildings) {
    const result = getBuildingHighestPoint(building);
    if (result) {
      demoState.sparkTargets.push(result.point);
    }
  }

  if (demoState.sparkTargets.length === 0) {
    for (let i = 0; i < 20; i++) {
      demoState.sparkTargets.push(
        new Vector3(
          (Math.random() - 0.5) * 2000,
          300 + Math.random() * 200,
          (Math.random() - 0.5) * 2000
        )
      );
    }
  }
}

function getMeshTopPoint(child: Mesh, worldPos: Vector3): number {
  let topY = worldPos.y;
  const geo = child.geometry as BoxGeometry;
  if (geo?.parameters?.height) {
    topY += (geo.parameters.height * child.scale.y) / 2;
  } else if (child.geometry && child.geometry.boundingBox) {
    topY = child.geometry.boundingBox.max.y * child.scale.y + worldPos.y;
  }
  return topY;
}

function isSpire(child: Mesh): boolean {
  return !!(
    child.geometry &&
    (child.geometry.type === 'ConeGeometry' || child.geometry.constructor.name === 'ConeGeometry')
  );
}

function isAntenna(child: Mesh): boolean {
  return !!(
    child.geometry &&
    child.geometry.type === 'BoxGeometry' &&
    child.scale.x < 5 &&
    child.scale.z < 5 &&
    child.scale.y > 20
  );
}

function getBuildingHighestPoint(buildingGroup: Object3D): { point: Vector3; maxY: number } | null {
  const highestPoint = new Vector3();
  let maxY = -Infinity;
  let foundSpire = false;

  buildingGroup.traverse((child: Object3D) => {
    if (!(child instanceof Mesh)) return;
    const worldPos = new Vector3();
    child.getWorldPosition(worldPos);
    const topY = getMeshTopPoint(child, worldPos);
    const isImportant = isSpire(child) || isAntenna(child);

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

function advanceToNextScene(world: ECSWorld, entity: any) {
  const demoState = entity.demoState;
  demoState.sceneTime = 0;
  const next = (demoState.sceneIndex + 1) % TOTAL_SCENES;
  beginTransition(world, entity, next);
  demoState.sceneIndex = next;
  setSceneDefaults(world, entity, demoState.sceneIndex);
}

function beginTransition(world: ECSWorld, entity: any, _nextIndex: number) {
  const res = world.resources;
  const demoState = entity.demoState;

  demoState.transitionFromPos.copy(res.camera.position);
  demoState.transitionFromTarget.copy(demoState.currentLookTarget);
  demoState.transitioning = true;
  demoState.transitionProgress = 0;
}

function setSceneDefaults(world: ECSWorld, entity: any, index: number) {
  const res = world.resources;
  const camera = res.camera;
  const demoState = entity.demoState;

  camera.rotation.set(0, 0, 0);
  demoState.cameraRoll = 0;

  switch (index) {
    case 0:
      demoState.cameraBasePosition.set(0, 800, 1200);
      demoState.currentLookTarget.set(0, 0, 0);
      break;
    case 1:
      demoState.cameraBasePosition.set(0, 30, 2000);
      demoState.currentLookTarget.set(0, 20, 1900);
      demoState.streetDist = 0;
      break;
    case 2:
      demoState.cameraBasePosition.set(800, 600, 0);
      demoState.currentLookTarget.set(0, 0, 0);
      break;
    case 3:
      demoState.cameraBasePosition.set(0, 150, 450);
      demoState.currentLookTarget.set(0, 200, 0);
      break;
  }
  camera.position.copy(demoState.cameraBasePosition);
  camera.lookAt(demoState.currentLookTarget);
}

function updateScene(_world: ECSWorld, entity: any, dt: number, time: number) {
  const demoState = entity.demoState;

  switch (demoState.sceneIndex) {
    case 0:
      updateSceneGenesis(entity, dt, time);
      break;
    case 1:
      updateSceneVelocity(entity, dt, time);
      break;
    case 2:
      updateSceneVortex(entity, dt, time);
      break;
    case 3:
      updateSceneSynthesis(entity, dt, time);
      break;
  }
}

function updateSceneGenesis(entity: any, _dt: number, time: number) {
  const demoState = entity.demoState;
  const postProcessing = entity.postProcessing;

  const progress = demoState.sceneTime / SCENE_DURATION;

  demoState.cameraBasePosition.x = Math.sin(time * 0.25) * 40;
  demoState.cameraBasePosition.y = 800 - progress * 500;
  demoState.cameraBasePosition.z = 1200 - progress * 900;

  demoState.currentLookTarget.set(0, 0, 0);

  if (postProcessing.afterimagePass) postProcessing.afterimagePass.enabled = false;
}

function updateSceneVelocity(entity: any, dt: number, time: number) {
  const demoState = entity.demoState;
  const postProcessing = entity.postProcessing;

  const speed = 800 + Math.sin(time * 2) * 100;

  demoState.cameraBasePosition.z -= speed * dt;
  demoState.streetDist += speed * dt;

  const weaveAmp = 120 + Math.sin(time * 1.2) * 40;
  demoState.cameraBasePosition.x = Math.sin(demoState.streetDist * 0.004 + time * 0.5) * weaveAmp;

  demoState.cameraBasePosition.y = 220 + Math.sin(time * 2.5) * 20;

  const lookDist = 350;
  const lookX =
    Math.sin((demoState.streetDist + lookDist * 2) * 0.004 + (time + 0.3) * 0.5) * weaveAmp * 0.6;
  demoState.currentLookTarget.set(lookX, 100, demoState.cameraBasePosition.z - lookDist);

  if (demoState.cameraBasePosition.z < -2000) {
    demoState.cameraBasePosition.z = 2000;
    demoState.cameraBasePosition.x = (Math.random() - 0.5) * 300;
    demoState.streetDist = 0;
  }

  if (postProcessing.afterimagePass) {
    postProcessing.afterimagePass.enabled = true;
    postProcessing.afterimagePass.uniforms['damp'].value = 0.82;
  }
}

function updateSceneVortex(entity: any, _dt: number, time: number) {
  const demoState = entity.demoState;
  const postProcessing = entity.postProcessing;

  const progress = demoState.sceneTime / SCENE_DURATION;

  const startR = 900;
  const endR = 150;
  const radius = startR + (endR - startR) * progress;
  const angle = time * 0.5;

  demoState.cameraBasePosition.x = Math.sin(angle) * radius;
  demoState.cameraBasePosition.z = Math.cos(angle) * radius;
  demoState.cameraBasePosition.y = 550 - progress * 400 + Math.sin(time * 1.8) * 40;

  demoState.currentLookTarget.set(0, 0, 0);

  if (postProcessing.afterimagePass) {
    postProcessing.afterimagePass.enabled = true;
    postProcessing.afterimagePass.uniforms['damp'].value = 0.72;
  }
}

function updateSceneSynthesis(entity: any, _dt: number, time: number) {
  const demoState = entity.demoState;
  const postProcessing = entity.postProcessing;

  const progress = demoState.sceneTime / SCENE_DURATION;

  const radius = 450 + progress * 350;
  const height = 150 + progress * 200;
  const angle = time * 0.3;

  demoState.cameraBasePosition.x = Math.sin(angle) * radius;
  demoState.cameraBasePosition.z = Math.cos(angle) * radius;
  demoState.cameraBasePosition.y = height + Math.sin(time * 0.6) * 15;

  demoState.currentLookTarget.set(0, 200 - progress * 100, 0);
  demoState.cameraRoll = 0;

  if (postProcessing.afterimagePass) {
    postProcessing.afterimagePass.enabled = true;
    postProcessing.afterimagePass.uniforms['damp'].value = 0.75;
  }

  if (postProcessing.glitchPass) postProcessing.glitchPass.enabled = false;
}

function updateCamera(world: ECSWorld, entity: any, dt: number) {
  const res = world.resources;
  const demoState = entity.demoState;

  if (demoState.transitioning) {
    demoState.transitionProgress = Math.min(
      1,
      demoState.transitionProgress + dt / TRANSITION_DURATION
    );
    const t = smoothstep(demoState.transitionProgress);

    const blendPos = new Vector3().lerpVectors(
      demoState.transitionFromPos,
      demoState.cameraBasePosition,
      t
    );
    res.camera.position.copy(blendPos).add(demoState.cameraShake);

    const blendTarget = new Vector3().lerpVectors(
      demoState.transitionFromTarget,
      demoState.currentLookTarget,
      t
    );
    res.camera.lookAt(blendTarget);

    if (demoState.transitionProgress >= 1) demoState.transitioning = false;
  } else {
    res.camera.position.copy(demoState.cameraBasePosition).add(demoState.cameraShake);
    res.camera.lookAt(demoState.currentLookTarget);
  }

  if (demoState.cameraRoll !== 0) {
    res.camera.rotation.z = demoState.cameraRoll;
  }
}

function decayEffects(entity: any, dt: number) {
  const demoState = entity.demoState;
  const postProcessing = entity.postProcessing;

  demoState.cameraShake.lerp(new Vector3(0, 0, 0), dt * 6);

  if (postProcessing.bloomPass) {
    postProcessing.bloomPass.strength = MathUtils.lerp(
      postProcessing.bloomPass.strength,
      postProcessing.originalBloomStrength,
      dt * 4
    );
  }

  if (postProcessing.glitchPass?.enabled && Math.random() > 0.95) {
    postProcessing.glitchPass.enabled = false;
  }
}

function applyCamera(world: ECSWorld, entity: any) {
  const res = world.resources;
  const demoState = entity.demoState;

  res.camera.position.copy(demoState.cameraBasePosition).add(demoState.cameraShake);
  res.camera.lookAt(demoState.currentLookTarget);
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function onAudioNote(entity: any, type: string, _data?: number) {
  const demoState = entity.demoState;
  const postProcessing = entity.postProcessing;

  if (type === 'kick') {
    if (postProcessing.bloomPass) postProcessing.bloomPass.strength = 3.0;
    demoState.cameraShake.y += (Math.random() - 0.5) * 6;
    if (postProcessing.glitchPass && Math.random() < 0.3) postProcessing.glitchPass.enabled = true;
  }

  if (type === 'snare') {
    if (postProcessing.bloomPass) postProcessing.bloomPass.strength = 2.5;
    demoState.cameraShake.x += (Math.random() - 0.5) * 5;

    if (demoState.sparkTargets.length > 0) {
      for (let k = 0; k < 3; k++) {
        const target =
          demoState.sparkTargets[Math.floor(Math.random() * demoState.sparkTargets.length)];
        for (let i = 0; i < 5; i++) {
          entity.world?.resources?.spawnSparks?.(target.clone());
        }
      }
    }
  }

  if (type === 'hihat') {
    demoState.cameraShake.z += (Math.random() - 0.5) * 2;
  }
}
