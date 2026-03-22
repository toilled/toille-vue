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
    :isMultiplayerConnected="isMultiplayerConnected"
    :playerCount="playerCount"
    :roomId="multiplayerRoomId"
    :myPeerId="multiplayerManager.getPlayerId()"
    @exit-game-mode="exitGameMode"
    @update-leaderboard="updateLeaderboard"
    @close-leaderboard="showLeaderboard = false"
  />
</template>

<script setup lang="ts">
import {
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  defineAsyncComponent,
} from "vue";
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
  ACESFilmicToneMapping,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { GameModeManager } from "../game/GameModeManager";
import { setupPostProcessing } from "../game/PostProcessingManager";
import { DrivingMode } from "../game/modes/DrivingMode";
import { DroneMode } from "../game/modes/DroneMode";
import { ExplorationMode } from "../game/modes/ExplorationMode";
import { FlyingTourMode } from "../game/modes/FlyingTourMode";
import { DemoMode } from "../game/modes/DemoMode";
import { GameContext } from "../game/types";
import { carAudio } from "../game/audio/CarAudio";
import { cyberpunkAudio } from "../utils/CyberpunkAudio";
import { multiplayerManager, RemotePlayer } from "../utils/MultiplayerManager";
import {
  BOUNDS,
  CELL_SIZE,
  START_OFFSET,
  DRONE_COUNT,
  GRID_SIZE,
} from "../game/config";
import {
  LEADERBOARD_CANVAS_SIZE,
  MOBILE_BREAKPOINT,
  SPARK_COUNT,
  SPARK_BURST_SIZE,
  SPARK_GRAVITY,
  SPARK_LIFETIME_DECAY,
  SPARK_OFF_SCREEN_Y,
  SPARK_MIN_VELOCITY,
  SPARK_RANDOM_VELOCITY,
  CAR_COUNT,
  CAMERA_FOV,
  CAMERA_FAR,
  CAMERA_NEAR,
  CAMERA_START_Y,
  CAMERA_TARGET_Y_DESKTOP,
  CAMERA_TARGET_Y_MOBILE,
  CAMERA_CINEMATIC_Y,
  CAMERA_LERP_FACTOR,
  CAMERA_LOOK_AT_LERP,
  ORBIT_RADIUS_DESKTOP,
  ORBIT_RADIUS_MOBILE,
  ORBIT_SPEED,
  INTRO_DURATION_MS,
  INTRO_ORBIT_RADIUS,
  INTRO_ORBIT_SPEED,
  RAYCASTER_POINTS_THRESHOLD,
  DRONE_SCORE_POINTS,
  DRONE_OSCILLATION_X,
  DRONE_OSCILLATION_Y,
  DRONE_OSCILLATION_Z,
  DRONE_EASING,
  AUDIO_VOLUME,
  AUDIO_DISTANCE_FACTOR,
  AUDIO_OSCILLATOR_FREQ_START,
  AUDIO_OSCILLATOR_FREQ_END,
  AUDIO_SWEEP_DURATION,
  CHECKPOINT_RADIUS,
  CHECKPOINT_HEIGHT,
  CHECKPOINT_SEGMENTS,
  CHECKPOINT_CORE_RADIUS,
  CHECKPOINT_CORE_SEGMENTS,
  EMISSIVE_INTENSITY_BOOST_BASS,
  EMISSIVE_INTENSITY_BOOST_HIHAT,
  EMISSIVE_INTENSITY_TARGET,
  EMISSIVE_LERP_FACTOR,
  SPARK_SPAWN_POSITIONS_OFF_Y,
  CHASE_ARROW_POSITION_Z,
} from "../game/constants/CyberpunkCity";
import { KonamiManager } from "../game/KonamiManager";
import { GangWarManager } from "../game/GangWarManager";
import { createDroneTexture } from "../utils/TextureGenerator";
import { CityBuilder } from "../game/CityBuilder";
import { TrafficSystem } from "../game/TrafficSystem";
import { getHeight } from "../utils/HeightMap";
import { audioManager } from "../utils/AudioManager";

const GameUI = defineAsyncComponent(() => import("./GameUI.vue"));

const canvasContainer = ref<HTMLDivElement | null>(null);

let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let composer: EffectComposer;
let animationId: number;
let isActive = false;

let occupiedGrids = new Map<
  string,
  { halfW: number; halfD: number; isRound?: boolean }
>();
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
const startTime = ref(0);
const distToTarget = ref(0);
let gameModeManager: GameModeManager;
let konamiManager: KonamiManager;
let gangWarManager: GangWarManager;
let trafficSystem: TrafficSystem;
let cityBuilder: CityBuilder;

const leaderboard = ref<ScoreEntry[]>([]);
const showLeaderboard = ref(false);

const isMultiplayerConnected = ref(false);
const playerCount = ref(0);
const multiplayerRoomId = ref("cyberpunk-city");
let remotePlayers = new Map<string, RemotePlayer>();
let lastTrafficBroadcast = 0;
let lastTrafficMovement = 0;
let previousTrafficHash = "";
let backgroundTrafficTimeout: ReturnType<typeof setTimeout> | null = null;
const TRAFFIC_TIMEOUT_MS = 8000;

function hashTrafficState(states: any[]): string {
  if (!states || states.length === 0) return "";
  return states
    .map((s) => `${s.index}:${Math.round(s.x)}:${Math.round(s.z)}`)
    .join("|");
}

let leaderboardCanvas: HTMLCanvasElement;
let leaderboardTexture: CanvasTexture;

function getRemotePlayers(): Map<string, RemotePlayer> {
  return remotePlayers;
}

function updateLeaderboard(newScores: ScoreEntry[]) {
  leaderboard.value = newScores;
  // Texture update is handled by watch(leaderboard)
}

function updateLeaderboardTexture() {
  if (!leaderboardCanvas) return;
  const ctx = leaderboardCanvas.getContext("2d");
  if (!ctx) return;

  // Reset transform to identity
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Background
  ctx.fillStyle = "#100010";
  ctx.fillRect(0, 0, LEADERBOARD_CANVAS_SIZE, LEADERBOARD_CANVAS_SIZE);

  // Scale everything by 2
  ctx.scale(2, 2);

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

watch(
  leaderboard,
  () => {
    updateLeaderboardTexture();
  },
  { deep: true },
);

function createLeaderboardTexture() {
  leaderboardCanvas = document.createElement("canvas");
  leaderboardCanvas.width = LEADERBOARD_CANVAS_SIZE;
  leaderboardCanvas.height = LEADERBOARD_CANVAS_SIZE;
  leaderboardTexture = new CanvasTexture(leaderboardCanvas);
  leaderboardTexture.anisotropy = 16;

  updateLeaderboardTexture();

  return leaderboardTexture;
}

const isMobile = ref(false);

const updateIsMobile = () => {
  if (typeof window !== "undefined") {
    isMobile.value = window.innerWidth <= MOBILE_BREAKPOINT;
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

const props = defineProps({
  showSplash: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["game-start", "game-end"]);

const currentLookAt = new Vector3(0, 0, 0);

const raycaster = new Raycaster();
const pointer = new Vector2();

// Sparks system
let sparks: Points;
const sparkPositions = new Float32Array(SPARK_COUNT * 3);
// Initialize sparks off-screen
for (let i = 0; i < SPARK_COUNT; i++) {
  sparkPositions[i * 3 + 1] = SPARK_SPAWN_POSITIONS_OFF_Y;
}
const sparkVelocities = new Float32Array(SPARK_COUNT * 3);
const sparkLifetimes = new Float32Array(SPARK_COUNT);

const route = useRoute();

function createCheckpoint() {
  const geo = new CylinderGeometry(
    CHECKPOINT_RADIUS,
    CHECKPOINT_RADIUS,
    CHECKPOINT_HEIGHT,
    CHECKPOINT_SEGMENTS,
    1,
    true,
  );
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

  const coreGeo = new CylinderGeometry(
    CHECKPOINT_CORE_RADIUS,
    CHECKPOINT_CORE_RADIUS,
    CHECKPOINT_HEIGHT,
    CHECKPOINT_CORE_SEGMENTS,
  );
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
  cone.position.z = CHASE_ARROW_POSITION_Z;

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

  for (let i = 0; i < SPARK_COUNT; i++) {
    if (sparkLifetimes[i] <= 0) {
      activateSpark(i, position, posAttribute);
      spawned++;
      if (spawned >= SPARK_BURST_SIZE) break;
    }
  }

  if (spawned < SPARK_BURST_SIZE) {
    for (let i = 0; i < SPARK_BURST_SIZE - spawned; i++) {
      const randIndex = Math.floor(Math.random() * SPARK_COUNT);
      activateSpark(randIndex, position, posAttribute);
    }
  }

  posAttribute.needsUpdate = true;
}

function activateSpark(
  i: number,
  position: Vector3,
  posAttribute: BufferAttribute,
) {
  sparkLifetimes[i] = 1.0;
  posAttribute.setXYZ(i, position.x, position.y, position.z);
  sparkVelocities[i * 3] = (Math.random() - 0.5) * SPARK_RANDOM_VELOCITY;
  sparkVelocities[i * 3 + 1] =
    Math.random() * SPARK_RANDOM_VELOCITY + SPARK_MIN_VELOCITY;
  sparkVelocities[i * 3 + 2] = (Math.random() - 0.5) * SPARK_RANDOM_VELOCITY;
}

onMounted(() => {
  if (!canvasContainer.value) return;

  updateIsMobile();

  // Scene setup
  scene = new Scene();
  scene.background = new Color(0x050510);

  // Camera setup
  camera = new PerspectiveCamera(
    CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    CAMERA_NEAR,
    CAMERA_FAR,
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
  composer = setupPostProcessing(scene, camera, renderer);

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
  trafficSystem = new TrafficSystem(scene, CAR_COUNT, spawnSparks);
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
  gangWarManager = new GangWarManager(
    scene,
    occupiedGrids,
    spawnSparks,
    playPewSound,
  );

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
    composer,
    cars,
    drones,
    droneTargetPositions,
    occupiedGrids,
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
    chaseArrow,
    multiplayer: multiplayerManager,
    getRemotePlayers,
  };
  gameModeManager = new GameModeManager(context);

  isActive = true;
  if (!props.showSplash) {
    startTime.value = Date.now();
  }
  animate();

  ScoreService.getTopScores().then((scores) => {
    leaderboard.value = scores;
    updateLeaderboardTexture();
  });

  cyberpunkAudio.addListener(onAudioNote);

  // Initialize multiplayer
  initMultiplayer();
});

function initMultiplayer() {
  multiplayerManager.setScene(scene);

  multiplayerManager.onConnectionChange((connected) => {
    isMultiplayerConnected.value = connected;
    if (connected) {
      playerCount.value = 1;
      if (!multiplayerManager.isHost) {
        trafficSystem.setNetworkControlled(true);
        multiplayerManager.requestTrafficState();
      } else {
        trafficSystem.setNetworkControlled(false);
        if (document.hidden) {
          startBackgroundTrafficUpdate();
        }
      }
    } else {
      playerCount.value = 0;
      trafficSystem.setNetworkControlled(false);
      stopBackgroundTrafficUpdate();
    }
  });

  multiplayerManager.onHostChange((isHost) => {
    if (isHost) {
      trafficSystem.setNetworkControlled(false);
      if (document.hidden) {
        startBackgroundTrafficUpdate();
      }
    } else {
      trafficSystem.setNetworkControlled(true);
      multiplayerManager.requestTrafficState();
      stopBackgroundTrafficUpdate();
    }
  });

  multiplayerManager.onTrafficStateChange((states) => {
    if (states.length > 0) {
      const newHash = hashTrafficState(states);
      if (newHash !== previousTrafficHash) {
        lastTrafficMovement = Date.now();
        previousTrafficHash = newHash;
      }
      trafficSystem.setNetworkControlled(true);
      trafficSystem.updateFromNetwork(states);
    }
  });

  multiplayerManager.onPlayerUpdate((players) => {
    remotePlayers = players;
    playerCount.value = players.size + 1;
  });

  multiplayerManager.onTrafficStateRequest(() => {
    return trafficSystem.getState();
  });

  multiplayerManager.connect("", "cyberpunk-city").catch(console.error);

  function startBackgroundTrafficUpdate() {
    if (backgroundTrafficTimeout) return;

    function tick() {
      if (
        multiplayerManager.isNetworkConnected() &&
        multiplayerManager.isHost &&
        !trafficSystem.isNetworkTrafficControlled()
      ) {
        trafficSystem.update();
        multiplayerManager.sendTrafficState(trafficSystem.getState());
      }
      if (
        multiplayerManager.isHost &&
        multiplayerManager.isNetworkConnected()
      ) {
        backgroundTrafficTimeout = setTimeout(tick, 33);
      } else {
        backgroundTrafficTimeout = null;
      }
    }

    backgroundTrafficTimeout = setTimeout(tick, 33);
  }

  function stopBackgroundTrafficUpdate() {
    if (backgroundTrafficTimeout) {
      clearTimeout(backgroundTrafficTimeout);
      backgroundTrafficTimeout = null;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (
        multiplayerManager.isHost &&
        multiplayerManager.isNetworkConnected()
      ) {
        startBackgroundTrafficUpdate();
      }
    } else {
      stopBackgroundTrafficUpdate();
    }
  });

  function checkTrafficTimeout() {
    if (
      !multiplayerManager.isHost &&
      multiplayerManager.isNetworkConnected() &&
      lastTrafficMovement > 0 &&
      Date.now() - lastTrafficMovement > TRAFFIC_TIMEOUT_MS &&
      playerCount.value > 1
    ) {
      multiplayerManager.becomeHost();
    }
  }

  setInterval(checkTrafficTimeout, 1000);
}

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

watch(
  () => props.showSplash,
  (newVal, oldVal) => {
    if (oldVal === true && newVal === false) {
      startTime.value = Date.now();
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

function startDemoMode() {
  isGameMode.value = true;
  emit("game-start");
  gameModeManager.setMode(new DemoMode());
}

defineExpose({ startExplorationMode, startFlyingTour, startDemoMode });

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

function onPointerLockChange() {}

function onClick(event: MouseEvent) {
  if (!camera) return;

  gameModeManager.onClick(event);

  if (isGameMode.value || isDrivingMode.value) return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  if (gangWarManager && gangWarManager.fightMarkers.length > 0) {
    const markerIntersects = raycaster.intersectObjects(
      gangWarManager.fightMarkers,
    );
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
    raycaster.params.Points.threshold = RAYCASTER_POINTS_THRESHOLD;
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

        posAttribute.setXYZ(index, 0, SPARK_OFF_SCREEN_Y, 0);
        posAttribute.needsUpdate = true;

        deadDrones.add(index);

        playPewSound();
        droneScore.value += DRONE_SCORE_POINTS;
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

  if (
    multiplayerManager.isNetworkConnected() &&
    !trafficSystem.isNetworkTrafficControlled()
  ) {
    const now = Date.now();
    if (now - lastTrafficBroadcast > 33) {
      multiplayerManager.sendTrafficState(trafficSystem.getState());
      lastTrafficBroadcast = now;
    }
  }

  if (cityBuilder) {
    const materials = cityBuilder.getAudioMaterials();
    for (const key in materials) {
      const mat = materials[key];
      if (mat.emissiveIntensity > EMISSIVE_INTENSITY_TARGET) {
        mat.emissiveIntensity = MathUtils.lerp(
          mat.emissiveIntensity,
          EMISSIVE_INTENSITY_TARGET,
          EMISSIVE_LERP_FACTOR,
        );
      }
    }
  }

  if (sparks) {
    const positions = sparks.geometry.attributes.position.array;
    let needsUpdate = false;

    for (let i = 0; i < SPARK_COUNT; i++) {
      if (sparkLifetimes[i] > 0) {
        sparkVelocities[i * 3 + 1] -= SPARK_GRAVITY;
        positions[i * 3] += sparkVelocities[i * 3];
        positions[i * 3 + 1] += sparkVelocities[i * 3 + 1];
        positions[i * 3 + 2] += sparkVelocities[i * 3 + 2];

        const h = getHeight(positions[i * 3], positions[i * 3 + 2]);

        if (positions[i * 3 + 1] < h) {
          positions[i * 3 + 1] = h;
          sparkVelocities[i * 3 + 1] *= -0.5;
        }

        const ix = Math.round((positions[i * 3] - START_OFFSET) / CELL_SIZE);
        const iz = Math.round(
          (positions[i * 3 + 2] - START_OFFSET) / CELL_SIZE,
        );

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

        sparkLifetimes[i] -= SPARK_LIFETIME_DECAY;
        if (sparkLifetimes[i] < 0) {
          sparkLifetimes[i] = 0;
          positions[i * 3 + 1] = SPARK_OFF_SCREEN_Y;
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
      const oscTime = Date.now() * 0.001;

      for (let i = 0; i < positions.length / 3; i++) {
        if (deadDrones.has(i)) continue;

        const offset = i;
        const oscX = Math.sin(oscTime + offset) * DRONE_OSCILLATION_X;
        const oscY = Math.cos(oscTime * 0.5 + offset) * DRONE_OSCILLATION_Y;
        const oscZ = Math.sin(oscTime * 0.8 + offset) * DRONE_OSCILLATION_Z;

        const targetX = droneTargetPositions[i * 3] + oscX;
        const targetY = droneTargetPositions[i * 3 + 1] + oscY;
        const targetZ = droneTargetPositions[i * 3 + 2] + oscZ;

        positions[i * 3] += (targetX - positions[i * 3]) * DRONE_EASING;
        positions[i * 3 + 1] += (targetY - positions[i * 3 + 1]) * DRONE_EASING;
        positions[i * 3 + 2] += (targetZ - positions[i * 3 + 2]) * DRONE_EASING;
      }
      drones.geometry.attributes.position.needsUpdate = true;
    }
  }

  if (!gameModeManager.getMode()) {
    if (isCinematicMode.value) {
      const angle = time * INTRO_ORBIT_SPEED;

      const tx = cinematicTarget.x + Math.sin(angle) * INTRO_ORBIT_RADIUS;
      const tz = cinematicTarget.z + Math.cos(angle) * INTRO_ORBIT_RADIUS;

      camera.position.x += (tx - camera.position.x) * CAMERA_LERP_FACTOR;
      camera.position.z += (tz - camera.position.z) * CAMERA_LERP_FACTOR;
      camera.position.y +=
        (CAMERA_CINEMATIC_Y - camera.position.y) * CAMERA_LERP_FACTOR;

      currentLookAt.lerp(cinematicTarget, CAMERA_LERP_FACTOR);
      camera.lookAt(currentLookAt);
    } else {
      const orbitRadius = isMobile.value
        ? ORBIT_RADIUS_MOBILE
        : ORBIT_RADIUS_DESKTOP;
      camera.position.x = Math.sin(time * ORBIT_SPEED) * orbitRadius;
      camera.position.z = Math.cos(time * ORBIT_SPEED) * orbitRadius;

      const targetY = isMobile.value
        ? CAMERA_TARGET_Y_MOBILE
        : CAMERA_TARGET_Y_DESKTOP;

      const introProgress =
        startTime.value === 0
          ? 0
          : Math.min(1, (now - startTime.value) / INTRO_DURATION_MS);

      if (startTime.value === 0) {
        camera.position.y = CAMERA_START_Y;
        camera.position.x =
          Math.sin(time * ORBIT_SPEED + Math.PI * 2) * orbitRadius;
        camera.position.z =
          Math.cos(time * ORBIT_SPEED + Math.PI * 2) * orbitRadius;
      } else if (introProgress < 1) {
        const ease = 1 - Math.pow(1 - introProgress, 3);
        const startY = CAMERA_START_Y;
        const currentY = startY + (targetY - startY) * ease;
        camera.position.y = currentY;

        const spiralAngle = (1 - ease) * Math.PI * 2;
        camera.position.x =
          Math.sin(time * ORBIT_SPEED + spiralAngle) * orbitRadius;
        camera.position.z =
          Math.cos(time * ORBIT_SPEED + spiralAngle) * orbitRadius;
      } else {
        if (Math.abs(camera.position.y - targetY) > 1) {
          camera.position.y +=
            (targetY - camera.position.y) * CAMERA_LERP_FACTOR;
        }
      }

      const targetLookAt = new Vector3(0, 0, 0);
      currentLookAt.lerp(targetLookAt, CAMERA_LOOK_AT_LERP);
      camera.lookAt(currentLookAt);
    }
  }

  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

function playPewSound(pos?: Vector3) {
  audioManager.init();
  const audioCtx = audioManager.ctx;
  const dest = audioManager.masterGain || audioManager.ctx?.destination;

  if (!audioCtx || !dest) return;

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(
    AUDIO_OSCILLATOR_FREQ_START,
    audioCtx.currentTime,
  );
  oscillator.frequency.exponentialRampToValueAtTime(
    AUDIO_OSCILLATOR_FREQ_END,
    audioCtx.currentTime + AUDIO_SWEEP_DURATION,
  );

  let volume = AUDIO_VOLUME;

  if (pos && camera) {
    const dist = pos.distanceTo(camera.position);
    volume = AUDIO_VOLUME / (1 + dist / AUDIO_DISTANCE_FACTOR);

    if (volume < 0.001) volume = 0;
  }

  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + AUDIO_SWEEP_DURATION,
  );

  oscillator.connect(gainNode);
  gainNode.connect(dest);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + AUDIO_SWEEP_DURATION);
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
    let boost = EMISSIVE_INTENSITY_BOOST_BASS;
    if (type === "hihat") boost = EMISSIVE_INTENSITY_BOOST_HIHAT;
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
  carAudio.stop();
  if (konamiManager) {
    konamiManager.dispose();
  }
  if (gangWarManager) {
    gangWarManager.dispose();
  }
  multiplayerManager.disconnect();
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
