<template>
  <div ref="canvasContainer" id="cyberpunk-city"></div>
  <GameUI
    :isDrivingMode="isDrivingMode"
    :isGameMode="isGameMode"
    :isExplorationMode="isExplorationMode"
    :isFlyingTour="isFlyingTour"
    :isCinematicMode="isCinematicMode"
    :isGameOver="isGameOver"
    :isMobile="isMobile"
    :drivingScore="drivingScore"
    :droneScore="droneScore"
    :timeLeft="timeLeft"
    :distToTarget="distToTarget"
    :controls="controls"
    :lookControls="lookControls"
    :leaderboard="leaderboard"
    :showLeaderboard="showLeaderboard"
    @exit-game-mode="exitGameMode"
    @update-leaderboard="updateLeaderboard"
    @close-leaderboard="showLeaderboard = false"
  />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";
import { ScoreService, type ScoreEntry } from "../utils/ScoreService";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  CylinderGeometry,
  MeshBasicMaterial,
  Mesh,
  DoubleSide,
  Group,
  ConeGeometry,
  Object3D,
  MathUtils,
  PCFSoftShadowMap,
  ACESFilmicToneMapping
} from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { GameModeManager } from "../game/GameModeManager";
import { DrivingMode } from "../game/modes/DrivingMode";
import { DroneMode } from "../game/modes/DroneMode";
import { ExplorationMode } from "../game/modes/ExplorationMode";
import { FlyingTourMode } from "../game/modes/FlyingTourMode";
import { GameContext } from "../game/types";
import { carAudio } from "../game/audio/CarAudio";
import { cyberpunkAudio } from "../utils/CyberpunkAudio";
import { BOUNDS, CELL_SIZE, START_OFFSET, DRONE_COUNT, GRID_SIZE } from "../game/config";
import { KonamiManager } from "../game/KonamiManager";
import { GangWarManager } from "../game/GangWarManager";
import { createDroneTexture } from "../utils/TextureGenerator";
import { CityBuilder } from "../game/CityBuilder";
import { TrafficSystem } from "../game/TrafficSystem";
import { getHeight } from "../utils/HeightMap";

const GameUI = defineAsyncComponent(() => import("./GameUI.vue"));

const canvasContainer = ref<HTMLDivElement | null>(null);

let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let composer: EffectComposer;
let animationId: number;
let isActive = false;

let occupiedGrids = new Map<string, { halfW: number; halfD: number }>();
let cars: Group[] = [];
let leaderboardMeshes: Mesh[] = [];

let drones: Points;
let droneTargetPositions: Float32Array;
let droneBasePositions: Float32Array;
const deadDrones = new Set<number>();
const score = ref(0);
const droneScore = ref(0);
const drivingScore = ref(0);
const isGameMode = ref(false);
const isDrivingMode = ref(false);
const isExplorationMode = ref(false);
const isFlyingTour = ref(false);
const isCinematicMode = ref(false);
const cinematicTarget = new Vector3();
const activeCar = ref<Group | null>(null);
let checkpointMesh: Mesh;
let navArrow: Group;
let chaseArrow: Group;
const timeLeft = ref(0);
const isGameOver = ref(false);
const lastTime = ref(0);
const distToTarget = ref(0);
let gameModeManager: GameModeManager;
let konamiManager: KonamiManager;
let gangWarManager: GangWarManager;
let trafficSystem: TrafficSystem;
let cityBuilder: CityBuilder;

const leaderboard = ref<ScoreEntry[]>([]);
const showLeaderboard = ref(false);

let leaderboardCanvas: HTMLCanvasElement;
let leaderboardTexture: CanvasTexture;

function updateLeaderboard(newScores: ScoreEntry[]) {
  leaderboard.value = newScores;
  // Texture update is handled by watch(leaderboard)
}

function updateLeaderboardTexture() {
  if (!leaderboardCanvas) return;
  const ctx = leaderboardCanvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#100010";
  ctx.fillRect(0, 0, 512, 512);

  // Border
  ctx.strokeStyle = "#00ffcc";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 504, 504);

  // Title
  ctx.fillStyle = "#00ffcc";
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.shadowColor = "#00ffcc";
  ctx.shadowBlur = 10;
  ctx.fillText("LEADERBOARD", 256, 80);
  ctx.shadowBlur = 0;

  // Header Line
  ctx.beginPath();
  ctx.moveTo(20, 100);
  ctx.lineTo(492, 100);
  ctx.stroke();

  // Scores
  ctx.font = "bold 40px Courier New";
  ctx.textAlign = "left";
  let y = 160;

  if (leaderboard.value.length === 0) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#aaaaaa";
    ctx.fillText("Loading...", 256, 250);
  } else {
    leaderboard.value.forEach((entry, idx) => {
      switch (idx) {
        case 0:
          ctx.fillStyle = "#ffff00"; // Gold
          break;
        case 1:
          ctx.fillStyle = "#cccccc"; // Silver
          break;
        case 2:
          ctx.fillStyle = "#cd7f32"; // Bronze
          break;
        default:
          ctx.fillStyle = "#ffffff";
          break;
      }

      // Format: 1. NAME   1000
      const rank = `${idx + 1}.`;
      const name = entry.name.substring(0, 8).toUpperCase();
      const scoreStr = entry.score.toString();
      
      ctx.fillText(rank, 40, y);
      ctx.fillText(name, 110, y);
      
      // Right align score
      ctx.textAlign = "right";
      ctx.fillText(scoreStr, 470, y);
      ctx.textAlign = "left";

      y += 60;
    });
  }
  
  // Footer / Instructions
  ctx.fillStyle = "#00ffcc";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("CRASH TO SUBMIT SCORE", 256, 480);

  if (leaderboardTexture) {
    leaderboardTexture.needsUpdate = true;
  }
}

watch(leaderboard, () => {
  updateLeaderboardTexture();
}, { deep: true });

function createLeaderboardTexture() {
  leaderboardCanvas = document.createElement("canvas");
  leaderboardCanvas.width = 512;
  leaderboardCanvas.height = 512;
  leaderboardTexture = new CanvasTexture(leaderboardCanvas);
  leaderboardTexture.anisotropy = 16;
  
  updateLeaderboardTexture();
  
  return leaderboardTexture;
}

const isMobile = ref(false);

const updateIsMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth <= 768;
  }
};

// Controls State
const controls = ref({
  left: false,
  right: false,
  forward: false,
  backward: false,
});

const lookControls = ref({
  left: false,
  right: false,
  up: false,
  down: false,
});

const emit = defineEmits(["game-start", "game-end"]);

const currentLookAt = new Vector3(0, 0, 0);

const raycaster = new Raycaster();
const pointer = new Vector2();

// Sparks system
let sparks: Points;
const sparkCount = 2000;
const sparkPositions = new Float32Array(sparkCount * 3);
// Initialize sparks off-screen
for (let i = 0; i < sparkCount; i++) {
  sparkPositions[i * 3 + 1] = -99999;
}
const sparkVelocities = new Float32Array(sparkCount * 3);
const sparkLifetimes = new Float32Array(sparkCount); // 0 = dead, 1 = full life

const route = useRoute();
const CAR_COUNT = 150;

function createCheckpoint() {
  const geo = new CylinderGeometry(25, 25, 1000, 32, 1, true);
  const mat = new MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.6,
    side: DoubleSide,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  checkpointMesh = new Mesh(geo, mat);
  checkpointMesh.visible = false;
  scene.add(checkpointMesh);

  const coreGeo = new CylinderGeometry(5, 5, 1000, 16);
  const coreMat = new MeshBasicMaterial({ color: 0xffffff });
  const core = new Mesh(coreGeo, coreMat);
  checkpointMesh.add(core);
}

function createNavArrow() {
  navArrow = new Group();

  const cone = new Mesh(
    new ConeGeometry(2, 7.5, 16),
    new MeshBasicMaterial({
      color: 0x888800, // Reduced brightness to avoid bloom
      depthTest: false,
      depthWrite: false,
      transparent: true,
      opacity: 0.9,
    }),
  );
  cone.rotation.x = Math.PI / 2;

  navArrow.add(cone);
  cone.renderOrder = 999;

  navArrow.visible = false;
  scene.add(navArrow);
}

function createChaseArrow() {
  chaseArrow = new Group();

  const cone = new Mesh(
    new ConeGeometry(2, 7.5, 16),
    new MeshBasicMaterial({
      color: 0xff0000,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      opacity: 0.0,
    }),
  );
  cone.rotation.x = Math.PI / 2;
  cone.position.z = 25;

  chaseArrow.add(cone);
  cone.renderOrder = 999;

  chaseArrow.visible = false;
  scene.add(chaseArrow);
}

function spawnCheckpoint() {
  const roadIndexX = Math.floor(Math.random() * (GRID_SIZE + 1));
  const roadIndexZ = Math.floor(Math.random() * (GRID_SIZE + 1));

  const axis = Math.random() > 0.5 ? "x" : "z";
  const roadCoordinate =
    START_OFFSET +
    (axis === "x" ? roadIndexX : roadIndexZ) * CELL_SIZE -
    CELL_SIZE / 2;

  const limit = (GRID_SIZE * CELL_SIZE) / 2;
  const otherCoord = (Math.random() - 0.5) * 2 * limit * 0.9;

  let x = 0,
    z = 0;
  if (axis === "x") {
    z = roadCoordinate;
    x = otherCoord;
  } else {
    x = roadCoordinate;
    z = otherCoord;
  }

  const h = getHeight(x, z);
  checkpointMesh.position.set(x, h, z);
  checkpointMesh.visible = true;
}

function spawnSparks(position: Vector3) {
  if (!sparks) return;
  const posAttribute = sparks.geometry.attributes.position;

  let spawned = 0;
  const burstSize = 30;

  for (let i = 0; i < sparkCount; i++) {
    if (sparkLifetimes[i] <= 0) {
      activateSpark(i, position, posAttribute);
      spawned++;
      if (spawned >= burstSize) break;
    }
  }

  if (spawned < burstSize) {
    for (let i = 0; i < burstSize - spawned; i++) {
      const randIndex = Math.floor(Math.random() * sparkCount);
      activateSpark(randIndex, position, posAttribute);
    }
  }

  posAttribute.needsUpdate = true;
}

function activateSpark(
  i: number,
  position: Vector3,
  posAttribute: BufferAttribute | any,
) {
  sparkLifetimes[i] = 1.0;
  posAttribute.setXYZ(i, position.x, position.y, position.z);
  sparkVelocities[i * 3] = (Math.random() - 0.5) * 5;
  sparkVelocities[i * 3 + 1] = Math.random() * 5 + 2;
  sparkVelocities[i * 3 + 2] = (Math.random() - 0.5) * 5;
}

onMounted(() => {
  if (!canvasContainer.value) return;

  updateIsMobile();

  // Scene setup
  scene = new Scene();
  scene.background = new Color(0x050510);

  // Camera setup
  camera = new PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    3000,
  );
  camera.position.set(0, 250, 600);
  camera.lookAt(0, 0, 0);

  // Renderer setup
  renderer = new WebGLRenderer({ antialias: false, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  canvasContainer.value.appendChild(renderer.domElement);

  // Post Processing
  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = 0.5;
  bloomPass.strength = 1.0;
  bloomPass.radius = 0.8;

  const outputPass = new OutputPass();

  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);

  // City Builder
  const lbTexture = createLeaderboardTexture();
  cityBuilder = new CityBuilder(scene);
  cityBuilder.buildCity(isMobile.value, lbTexture);
  const buildings = cityBuilder.getBuildings();
  occupiedGrids = cityBuilder.getOccupiedGrids();

  // Extract leaderboard meshes for raycasting
  buildings.forEach((b) => {
    b.traverse((c) => {
      if (c instanceof Mesh && c.userData.isLeaderboard) {
        leaderboardMeshes.push(c);
      }
    });
  });

  // Traffic System
  trafficSystem = new TrafficSystem(scene, CAR_COUNT, occupiedGrids, spawnSparks);
  cars = trafficSystem.getCars();

  // Drone Swarm
  const droneGeo = new BufferGeometry();
  const droneCount = DRONE_COUNT;
  const dronePositions = new Float32Array(droneCount * 3);
  const droneColorsArray = new Float32Array(droneCount * 3);
  droneTargetPositions = new Float32Array(droneCount * 3);
  droneBasePositions = new Float32Array(droneCount * 3);

  const baseRand = mulberry32(1337);
  for (let i = 0; i < droneCount; i++) {
    const range = BOUNDS * 2;
    droneBasePositions[i * 3] = (baseRand() - 0.5) * range;
    droneBasePositions[i * 3 + 1] = 300 + baseRand() * 800;
    droneBasePositions[i * 3 + 2] = (baseRand() - 0.5) * range;
  }

  const dColor1 = new Color(0xff0000); // Red
  const dColor2 = new Color(0x00ffcc); // Cyan
  const dColor3 = new Color(0x00ff00); // Green
  const dColor4 = new Color(0xffffff); // White

  generateDroneTargets(route.path);

  for (let i = 0; i < droneCount * 3; i++) {
    dronePositions[i] = droneTargetPositions[i];
  }

  for (let i = 0; i < droneCount; i++) {
    const c = Math.random();
    let finalColor = dColor4;
    if (c < 0.25) finalColor = dColor1;
    else if (c < 0.5) finalColor = dColor2;
    else if (c < 0.75) finalColor = dColor3;

    droneColorsArray[i * 3] = finalColor.r;
    droneColorsArray[i * 3 + 1] = finalColor.g;
    droneColorsArray[i * 3 + 2] = finalColor.b;
  }

  droneGeo.setAttribute("position", new BufferAttribute(dronePositions, 3));
  droneGeo.setAttribute("color", new BufferAttribute(droneColorsArray, 3));

  const droneMaterial = new PointsMaterial({
    size: 15,
    map: createDroneTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  drones = new Points(droneGeo, droneMaterial);
  scene.add(drones);

  // Initialize Sparks
  const sparkGeo = new BufferGeometry();
  sparkGeo.setAttribute("position", new BufferAttribute(sparkPositions, 3));

  const sparkMat = new PointsMaterial({
    color: 0xffaa00,
    size: 3,
    transparent: true,
    opacity: 1,
    blending: AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false,
  });

  sparks = new Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false;
  scene.add(sparks);

  // Initialize Fireworks via Manager
  konamiManager = new KonamiManager(scene);

  // Initialize Gang Wars
  gangWarManager = new GangWarManager(scene, occupiedGrids, spawnSparks, playPewSound);

  createCheckpoint();
  createNavArrow();
  createChaseArrow();

  window.addEventListener("resize", onResize);
  window.addEventListener("click", onClick);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("mousemove", onMouseMove);
  document.addEventListener("pointerlockchange", onPointerLockChange);

  // Initialize Game Context and Manager
  const context: GameContext = {
    scene,
    camera,
    renderer,
    cars,
    drones,
    occupiedGrids,
    // @ts-ignore
    buildings,
    score,
    droneScore,
    drivingScore,
    timeLeft,
    activeCar,
    isMobile,
    isGameOver,
    distToTarget,
    controls,
    lookControls,
    spawnSparks,
    playPewSound,
    spawnCheckpoint,
    checkpointMesh,
    navArrow,
    chaseArrow
  };
  gameModeManager = new GameModeManager(context);

  isActive = true;
  animate();

  ScoreService.getTopScores().then((scores) => {
    leaderboard.value = scores;
    updateLeaderboardTexture();
  });

  cyberpunkAudio.addListener(onAudioNote);
});

function onKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    exitGameMode();
    return;
  }
  konamiManager.onKeyDown(event);
  gameModeManager.onKeyDown(event);
}

function onKeyUp(event: KeyboardEvent) {
  gameModeManager.onKeyUp(event);
}

function mulberry32(a: number) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateDroneTargets(path: string) {
  let seed = 0;
  for (let i = 0; i < path.length; i++) {
    seed = (seed << 5) - seed + path.charCodeAt(i);
    seed |= 0;
  }
  seed = Math.abs(seed) + 1;

  const rand = mulberry32(seed);

  for (let i = 0; i < droneTargetPositions.length / 3; i++) {
    const xOffset = (rand() - 0.5) * 500;
    const yOffset = (rand() - 0.5) * 200;
    const zOffset = (rand() - 0.5) * 500;

    if (droneBasePositions) {
      droneTargetPositions[i * 3] = droneBasePositions[i * 3] + xOffset;
      droneTargetPositions[i * 3 + 1] = droneBasePositions[i * 3 + 1] + yOffset;
      droneTargetPositions[i * 3 + 2] = droneBasePositions[i * 3 + 2] + zOffset;
    } else {
      droneTargetPositions[i * 3] = xOffset * 8;
      droneTargetPositions[i * 3 + 1] = 300 + (yOffset + 100) * 4;
      droneTargetPositions[i * 3 + 2] = zOffset * 8;
    }
  }
}

watch(
  () => route.path,
  (newPath) => {
    if (!isGameMode.value && !isDrivingMode.value) {
      generateDroneTargets(newPath);
    }
  },
);

watch(activeCar, (newCar, oldCar) => {
  if (oldCar) trafficSystem.removeLightsFromCar(oldCar);
  if (newCar) trafficSystem.addLightsToCar(newCar);
});

watch(droneScore, (val) => {
  if (val >= 500 && !isGameMode.value && !isDrivingMode.value) {
    startTargetPractice();
  }
});

function startTargetPractice() {
  isGameMode.value = true;
  emit("game-start");
  gameModeManager.setMode(new DroneMode());
}

function startExplorationMode() {
  isGameMode.value = true;
  isExplorationMode.value = true;
  emit("game-start");
  gameModeManager.setMode(new ExplorationMode());
}

function startFlyingTour() {
  isGameMode.value = true;
  isFlyingTour.value = true;
  emit("game-start");
  gameModeManager.setMode(new FlyingTourMode());
}

defineExpose({ startExplorationMode, startFlyingTour });

function exitGameMode() {
  gameModeManager.clearMode();

  if (isDrivingMode.value) {
    isDrivingMode.value = false;
  }

  if (isExplorationMode.value) {
    isExplorationMode.value = false;
  }

  if (isFlyingTour.value) {
    isFlyingTour.value = false;
  }

  isCinematicMode.value = false;
  isGameMode.value = false;
  isGameOver.value = false;
  score.value = 0;
  droneScore.value = 0;
  drivingScore.value = 0;
  emit("game-end");

  if (drones && droneTargetPositions) {
    const positions = drones.geometry.attributes.position.array;
    const count = positions.length / 3;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = droneTargetPositions[i * 3];
      positions[i * 3 + 1] = droneTargetPositions[i * 3 + 1];
      positions[i * 3 + 2] = droneTargetPositions[i * 3 + 2];
    }
    drones.geometry.attributes.position.needsUpdate = true;
  }
}

function onResize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (composer) {
    composer.setSize(window.innerWidth, window.innerHeight);
  }
  updateIsMobile();
}

function onPointerLockChange() {
}

function onClick(event: MouseEvent) {
  if (!camera) return;

  gameModeManager.onClick(event);

  if (isGameMode.value || isDrivingMode.value) return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  if (gangWarManager && gangWarManager.fightMarkers.length > 0) {
    const markerIntersects = raycaster.intersectObjects(gangWarManager.fightMarkers);
    if (markerIntersects.length > 0) {
      const hit = markerIntersects[0].object;
      if (hit.userData.isFightMarker && hit.userData.target) {
        isGameMode.value = true;
        isCinematicMode.value = true;
        cinematicTarget.copy(hit.userData.target);
        emit("game-start");
        return;
      }
    }
  }

  const carMeshes: Object3D[] = [];
  cars.forEach((c) =>
    c.traverse((child) => {
      if (child instanceof Mesh) carMeshes.push(child);
    }),
  );

  const carIntersects = raycaster.intersectObjects(carMeshes);
  if (carIntersects.length > 0) {
    const hit = carIntersects[0].object;
    let target = hit;
    while (target.parent && target.parent.type !== "Scene") {
      target = target.parent;
    }

    if (target instanceof Group && target.userData.speed !== undefined) {
      isDrivingMode.value = true;
      emit("game-start");
      
      activeCar.value = target;
      target.userData.isPlayerControlled = true;
      target.userData.currentSpeed = target.userData.speed;
      
      gameModeManager.setMode(new DrivingMode());
      return;
    }
  }

  if (leaderboardMeshes.length > 0) {
    const lbIntersects = raycaster.intersectObjects(leaderboardMeshes);
    if (lbIntersects.length > 0) {
      showLeaderboard.value = true;
      return;
    }
  }
  
  if (drones && !isExplorationMode.value) {
    raycaster.params.Points.threshold = 20; 
    const intersects = raycaster.intersectObject(drones);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const index = intersect.index;

      if (index !== undefined && !deadDrones.has(index)) {
        const posAttribute = drones.geometry.attributes.position;
        const x = posAttribute.getX(index);
        const y = posAttribute.getY(index);
        const z = posAttribute.getZ(index);

        spawnSparks(new Vector3(x, y, z));

        posAttribute.setXYZ(index, 0, -99999, 0);
        posAttribute.needsUpdate = true;

        deadDrones.add(index);

        playPewSound();
        droneScore.value += 100;
      }
    }
  }
}

function onMouseMove(event: MouseEvent) {
  gameModeManager.onMouseMove(event);
}

function animate() {
  if (!isActive) return;
  animationId = requestAnimationFrame(animate);

  const now = Date.now();
  const time = now * 0.0005;
  const dt = (now - lastTime.value) / 1000;
  lastTime.value = now;

  konamiManager.update(dt);
  gangWarManager.update(dt);
  gameModeManager.update(dt, time);
  trafficSystem.update();

  if (cityBuilder) {
    const materials = cityBuilder.getAudioMaterials();
    for (const key in materials) {
      const mat = materials[key];
      if (mat.emissiveIntensity > 0.2) {
        mat.emissiveIntensity = MathUtils.lerp(mat.emissiveIntensity, 0.2, 0.1);
      }
    }
  }

  if (sparks) {
    const positions = sparks.geometry.attributes.position.array;
    let needsUpdate = false;

    for (let i = 0; i < sparkCount; i++) {
      if (sparkLifetimes[i] > 0) {
        sparkVelocities[i * 3 + 1] -= 0.1; // gravity
        positions[i * 3] += sparkVelocities[i * 3];
        positions[i * 3 + 1] += sparkVelocities[i * 3 + 1];
        positions[i * 3 + 2] += sparkVelocities[i * 3 + 2];

        const h = getHeight(positions[i * 3], positions[i * 3 + 2]);

        if (positions[i * 3 + 1] < h) {
          positions[i * 3 + 1] = h;
          sparkVelocities[i * 3 + 1] *= -0.5;
        }

        const ix = Math.round((positions[i * 3] - START_OFFSET) / CELL_SIZE);
        const iz = Math.round((positions[i * 3 + 2] - START_OFFSET) / CELL_SIZE);

        if (occupiedGrids.has(`${ix},${iz}`)) {
          const cX = START_OFFSET + ix * CELL_SIZE;
          const cZ = START_OFFSET + iz * CELL_SIZE;
          const dims = occupiedGrids.get(`${ix},${iz}`);

          if (
            dims &&
            Math.abs(positions[i * 3] - cX) < dims.halfW &&
            Math.abs(positions[i * 3 + 2] - cZ) < dims.halfD
          ) {
            sparkLifetimes[i] = 0;
          }
        }

        sparkLifetimes[i] -= 0.02;
        if (sparkLifetimes[i] < 0) {
          sparkLifetimes[i] = 0;
          positions[i * 3 + 1] = -100;
        }
        needsUpdate = true;
      }
    }
    if (needsUpdate) {
      sparks.geometry.attributes.position.needsUpdate = true;
    }
  }

  const isDroneMode = gameModeManager.getMode() instanceof DroneMode;
  
  if (drones && !isDroneMode) {
    const positions = drones.geometry.attributes.position.array;
    
    if (droneTargetPositions) {
        const easing = 0.02;
        const oscTime = Date.now() * 0.001;

        for (let i = 0; i < positions.length / 3; i++) {
            if (deadDrones.has(i)) continue;

            const offset = i;
            const oscX = Math.sin(oscTime + offset) * 20;
            const oscY = Math.cos(oscTime * 0.5 + offset) * 10;
            const oscZ = Math.sin(oscTime * 0.8 + offset) * 20;

            const targetX = droneTargetPositions[i * 3] + oscX;
            const targetY = droneTargetPositions[i * 3 + 1] + oscY;
            const targetZ = droneTargetPositions[i * 3 + 2] + oscZ;

            positions[i * 3] += (targetX - positions[i * 3]) * easing;
            positions[i * 3 + 1] += (targetY - positions[i * 3 + 1]) * easing;
            positions[i * 3 + 2] += (targetZ - positions[i * 3 + 2]) * easing;
        }
        drones.geometry.attributes.position.needsUpdate = true;
    }
  }

  if (!gameModeManager.getMode()) {
    if (isCinematicMode.value) {
       const orbitRadius = 200;
       const orbitSpeed = 0.5;
       const angle = time * orbitSpeed;

       const tx = cinematicTarget.x + Math.sin(angle) * orbitRadius;
       const tz = cinematicTarget.z + Math.cos(angle) * orbitRadius;

       camera.position.x += (tx - camera.position.x) * 0.05;
       camera.position.z += (tz - camera.position.z) * 0.05;
       camera.position.y += (150 - camera.position.y) * 0.05;

       currentLookAt.lerp(cinematicTarget, 0.05);
       camera.lookAt(currentLookAt);

    } else {
       const orbitRadius = isMobile.value ? 1400 : 800;
       camera.position.x = Math.sin(time * 0.1) * orbitRadius;
       camera.position.z = Math.cos(time * 0.1) * orbitRadius;

       const targetY = isMobile.value ? 350 : 250;
       if (Math.abs(camera.position.y - targetY) > 1) {
         camera.position.y += (targetY - camera.position.y) * 0.05;
       }

       const targetLookAt = new Vector3(0, 0, 0);
       currentLookAt.lerp(targetLookAt, 0.02);
       camera.lookAt(currentLookAt);
    }
  }
  
  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

let audioCtx: AudioContext | null = null;

function playPewSound(pos?: Vector3) {
  const AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    110,
    audioCtx.currentTime + 0.2,
  );

  let volume = 0.1;

  if (pos && camera) {
      const dist = pos.distanceTo(camera.position);
      volume = 0.1 / (1 + dist / 300);

      if (volume < 0.001) volume = 0;
  }

  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.2);
}

function onAudioNote(type: string, data?: any) {
  if (!cityBuilder) return;
  const materials = cityBuilder.getAudioMaterials();
  let key = "";
  if (type === "bass") {
    key = `bass${data}`;
  } else {
    key = type;
  }
  if (materials[key]) {
    let boost = 2.0;
    if (type === "hihat") boost = 1.0;
    materials[key].emissiveIntensity = boost;
  }
}

onBeforeUnmount(() => {
  cyberpunkAudio.removeListener(onAudioNote);
  isActive = false;
  window.removeEventListener("resize", onResize);
  window.removeEventListener("click", onClick);
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("pointerlockchange", onPointerLockChange);

  cancelAnimationFrame(animationId);
  if (renderer) {
    renderer.dispose();
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  carAudio.stop();
  if (carAudio.ctx) {
    carAudio.ctx.close();
  }
  if (konamiManager) {
    konamiManager.dispose();
  }
  if (gangWarManager) {
    gangWarManager.dispose();
  }
});
</script>

<style scoped>
#cyberpunk-city {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
