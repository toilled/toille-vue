<template>
  <div id="cyberpunk-city-wrapper">
    <div ref="canvasContainer" id="cyberpunk-city"></div>
    <Transition name="glitch-fade">
      <SplashScreen v-if="showSplash" />
    </Transition>
  </div>
  <GameUI
    :isDrivingMode="isDrivingMode"
    :isGameMode="isGameMode"
    :isExplorationMode="isExplorationMode"
    :isCinematicMode="isCinematicMode"
    :isGameOver="isGameOver"
    :isMobile="isMobile"
    :drivingScore="drivingScore"
    :timeLeft="timeLeft"
    :distToTarget="distToTarget"
    :controls="controls"
    :lookControls="lookControls"
    :leaderboard="leaderboard"
    :showLeaderboard="showLeaderboard"
    :gameSessionId="gameSessionId"
    @exit-game-mode="exitGameMode"
    @update-leaderboard="updateLeaderboard"
    @close-leaderboard="showLeaderboard = false"
  />
  <MiniMap
    :playerX="minimapData.playerX"
    :playerZ="minimapData.playerZ"
    :playerRotation="minimapData.playerRotation"
    :objectives="minimapData.objectives"
    :visible="isExplorationMode && storyState.active"
  />
  <SignalFinder :visible="showSignalFinder" :signalStrength="signalStrength" />
  <StoryHint :visible="showStoryHintEl" />
  <Transition name="fade">
    <div v-if="onlineCount > 0" id="online-indicator">
      <span id="online-dot"></span>
      {{ onlineCount }}
    </div>
  </Transition>
  <Transition name="fade">
    <div v-if="hdrSupported" id="hdr-badge">HDR</div>
  </Transition>
  <StoryTriggerPrompt :visible="showStoryTriggerPrompt" />
  <StoryDialog
    :visible="storyState.active"
    :showingBriefing="storyState.showingBriefing"
    :showingDialogue="storyState.showingDialogue"
    :missionComplete="storyState.missionComplete"
    :dialogueIndex="storyState.currentDialogueIndex"
    :currentMission="storyState.missions[storyState.currentMissionIndex] ?? null"
    :hasNextMission="storyState.currentMissionIndex < storyState.missions.length - 1"
    @dismiss="dismissStoryBriefing"
    @advance="advanceStoryDialogue"
  />
</template>

<script setup lang="ts">
import SplashScreen from './SplashScreen.vue';
import MiniMap from './MiniMap.vue';
import StoryDialog from './StoryDialog.vue';
import SignalFinder from './SignalFinder.vue';
import StoryHint from './StoryHint.vue';
import StoryTriggerPrompt from './StoryTriggerPrompt.vue';
import { ScoreService, type ScoreEntry } from '../utils/ScoreService';
import { StoryManager } from '../game/StoryManager';
import { StoryItemsManager, STORY_TRIGGER_POSITION } from '../game/StoryItemsManager';
import {
  AdditiveBlending,
  CanvasTexture,
  PerspectiveCamera,
  Scene,
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
  PCFShadowMap,
  ACESFilmicToneMapping,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GameModeManager } from '../game/GameModeManager';
import { setupPostProcessing } from '../game/PostProcessingManager';
import { ExplorationMode } from '../game/modes/ExplorationMode';
import { DemoMode } from '../game/modes/DemoMode';
import { GameContext, StoryState, MinimapData } from '../game/types';
import { carAudio } from '../game/audio/CarAudio';
import { cyberpunkAudio } from '../utils/CyberpunkAudio';
import { CELL_SIZE, START_OFFSET, GRID_SIZE } from '../game/config';
import {
  CAR_COUNT,
  CAMERA_FOV,
  CAMERA_FAR,
  CAMERA_NEAR,
  CAMERA_START_Y,
  CAMERA_TARGET_Y_DESKTOP,
  CAMERA_CINEMATIC_Y,
  CAMERA_LERP_FACTOR,
  CAMERA_LOOK_AT_LERP,
  ORBIT_RADIUS_DESKTOP,
  ORBIT_SPEED,
  INTRO_DURATION_MS,
  INTRO_ORBIT_RADIUS,
  INTRO_ORBIT_SPEED,
  CHECKPOINT_RADIUS,
  CHECKPOINT_HEIGHT,
  CHECKPOINT_SEGMENTS,
  CHECKPOINT_CORE_RADIUS,
  CHECKPOINT_CORE_SEGMENTS,
  EMISSIVE_INTENSITY_TARGET,
  EMISSIVE_LERP_FACTOR,
  CHASE_ARROW_POSITION_Z,
} from '../game/constants/CyberpunkCity';
import { KonamiManager } from '../game/KonamiManager';
import { GangWarManager } from '../game/GangWarManager';
import { CityBuilder } from '../game/CityBuilder';
import { TrafficSystem } from '../game/TrafficSystem';
import { SkyEffects } from '../game/SkyEffects';
import { getHeight } from '../utils/HeightMap';
import { audioManager } from '../utils/AudioManager';
import { MultiplayerManager } from '../game/MultiplayerManager';
import { getBrowserQuality, isMobile as checkMobile } from '../utils/BrowserDetect';
import { drawLeaderboard, createLeaderboardCanvas } from '../utils/LeaderboardRenderer';
import { SparkSystem } from '../utils/SparkSystem';
import { useI18n } from 'vue-i18n';
import { useEpilepsyWarning } from '../composables/useEpilepsyWarning';

const { t } = useI18n();
const { confirm: epilepsyConfirm } = useEpilepsyWarning();
import { useHdrDisplay } from '../composables/useHdrDisplay';
import { useCyberpunkClick } from '../composables/useCyberpunkClick';
import { useGameAudio } from '../composables/useGameAudio';
import { useFallbackMode } from '../composables/useFallbackMode';

const GameUI = defineAsyncComponent(() => import('./GameUI.vue'));

const canvasContainer = ref<HTMLDivElement | null>(null);

let scene!: Scene;
let camera!: PerspectiveCamera;
let renderer: WebGLRenderer;
let composer: EffectComposer;
let animationId: number;
let isActive = false;
let deferredInitCancelled = false;
let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

let buildings: Object3D[] = [];
let occupiedGrids = new Map<string, { halfW: number; halfD: number; isRound?: boolean }>();
let cars: Group[] = [];
let leaderboardMeshes: Mesh[] = [];

const score = ref(0);
const drivingScore = ref(0);
const isGameMode = ref(false);
const isDrivingMode = ref(false);
const isExplorationMode = ref(false);
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
let multiplayerManager: MultiplayerManager;
let skyEffects: SkyEffects;

const leaderboard = ref<ScoreEntry[]>([]);
const showLeaderboard = ref(false);
const gameSessionId = ref<string | null>(null);

let leaderboardCanvas: HTMLCanvasElement;
let leaderboardTexture: CanvasTexture;

function updateLeaderboard(newScores: ScoreEntry[]) {
  leaderboard.value = newScores;
}

watch(
  leaderboard,
  () => {
    if (leaderboardCanvas && leaderboardTexture) {
      drawLeaderboard(leaderboardCanvas, leaderboardTexture, leaderboard.value);
    }
  },
  { deep: true }
);

function createLeaderboardTexture() {
  const result = createLeaderboardCanvas();
  leaderboardCanvas = result.canvas;
  leaderboardTexture = result.texture;
  drawLeaderboard(leaderboardCanvas, leaderboardTexture, leaderboard.value);
  return leaderboardTexture;
}

let storyManager: StoryManager;
let storyItemsManager: StoryItemsManager | null = null;

const nearStoryTrigger = ref(false);
const signalStrength = ref(0);
const showStoryHint = ref(false);

const storyState = ref<StoryState>({
  active: false,
  currentMissionIndex: 0,
  currentDialogueIndex: 0,
  showingDialogue: false,
  showingBriefing: false,
  missionComplete: false,
  missions: [],
});

const minimapData = ref<MinimapData>({
  playerX: 0,
  playerZ: 0,
  playerRotation: 0,
  objectives: [],
});

function updateStoryObjective(missionIdx: number, objIdx: number) {
  if (storyManager) {
    storyManager.completeObjective(missionIdx, objIdx);
    storyItemsManager?.completeObjective(missionIdx, objIdx);
  }
}

function advanceStoryDialogue() {
  if (storyManager) {
    storyManager.advanceDialogue();
  }
}

function dismissStoryBriefing() {
  if (storyManager) {
    storyManager.dismissBriefing();
  }
}

function isStoryTriggerHidden(): boolean {
  return storyItemsManager?.isTriggerHidden() ?? false;
}

function activateStoryTrigger() {
  if (isFallbackMode.value) return;
  if (!isGameMode.value) {
    gameModeManager.setMode(new ExplorationMode(), 'exploration');
  }
  storyManager.start();
  storyItemsManager?.hideTrigger();
  storyItemsManager?.setCurrentMission(0);
  nearStoryTrigger.value = false;
}

const isMobile = ref(checkMobile());

const ZERO_VEC = new Vector3(0, 0, 0);

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

const _props = defineProps({});

const emit = defineEmits(['game-start', 'game-end', 'fallback']);
const showSplash = ref(true);

const { hdrSupported, checkHdr } = useHdrDisplay();
const isFallbackMode = ref(false);
const onlineCount = ref(0);
const showSignalFinder = computed(
  () => isExplorationMode.value && !storyState.value.active && !isStoryTriggerHidden()
);
const showStoryHintEl = computed(
  () =>
    showStoryHint.value &&
    isExplorationMode.value &&
    !storyState.value.active &&
    signalStrength.value > 0.4
);
const showStoryTriggerPrompt = computed(
  () => nearStoryTrigger.value && isExplorationMode.value && !storyState.value.active
);
const currentLookAt = new Vector3(0, 0, 0);

// Sparks system
let sparkSystem: SparkSystem;

function createCheckpoint() {
  const geo = new CylinderGeometry(
    CHECKPOINT_RADIUS,
    CHECKPOINT_RADIUS,
    CHECKPOINT_HEIGHT,
    CHECKPOINT_SEGMENTS,
    1,
    true
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
    CHECKPOINT_CORE_SEGMENTS
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
    })
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
    })
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

  const axis = Math.random() > 0.5 ? 'x' : 'z';
  const roadCoordinate =
    START_OFFSET + (axis === 'x' ? roadIndexX : roadIndexZ) * CELL_SIZE - CELL_SIZE / 2;

  const limit = (GRID_SIZE * CELL_SIZE) / 2;
  const otherCoord = (Math.random() - 0.5) * 2 * limit * 0.9;

  let x = 0,
    z = 0;
  if (axis === 'x') {
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

function spawnSparks(position: { x: number; y: number; z: number }) {
  sparkSystem.burst(new Vector3(position.x, position.y, position.z));
}

function initScene(width: number, height: number) {
  scene = new Scene();

  camera = new PerspectiveCamera(CAMERA_FOV, width / height, CAMERA_NEAR, CAMERA_FAR);
  camera.position.set(0, 250, 600);
  camera.lookAt(0, 0, 0);
}

const browserQuality = getBrowserQuality();

function initRenderer(width: number, height: number) {
  renderer = new WebGLRenderer({
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(browserQuality.pixelRatioCap);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = browserQuality.shadowMapType === 1 ? PCFShadowMap : PCFSoftShadowMap;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = hdrSupported.value ? 2.0 : 1.4;
  renderer.outputColorSpace = 'srgb';
  canvasContainer.value!.appendChild(renderer.domElement);

  composer = setupPostProcessing(scene, camera, renderer, browserQuality);
}

function initGameWorld() {
  skyEffects = new SkyEffects(scene);
  skyEffects.addClouds();

  const lbTexture = createLeaderboardTexture();
  cityBuilder = new CityBuilder(scene);
  cityBuilder.buildCity(isMobile.value, lbTexture);
  buildings = cityBuilder.getBuildings();
  occupiedGrids = cityBuilder.getOccupiedGrids();

  buildings.forEach((b) => {
    b.traverse((c) => {
      if (c instanceof Mesh && c.userData.isLeaderboard) {
        leaderboardMeshes.push(c);
      }
    });
  });
}

function initTrafficAndSparks() {
  trafficSystem = new TrafficSystem(scene, CAR_COUNT, (pos) => spawnSparks(pos));
  cars = trafficSystem.getCars();

  sparkSystem = new SparkSystem(scene);
}

function initGameManagers() {
  konamiManager = new KonamiManager(scene);

  gangWarManager = new GangWarManager(scene, occupiedGrids, spawnSparks, playPewSound);

  multiplayerManager = new MultiplayerManager(scene, onlineCount);

  createCheckpoint();
  createNavArrow();
  createChaseArrow();
}

function initEventListeners() {
  window.addEventListener('resize', onResize);
  window.addEventListener('click', onClick);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousemove', onMouseMove);
}

function initStoryAndMode() {
  storyManager = new StoryManager(storyState);

  storyItemsManager = new StoryItemsManager(scene);
  storyItemsManager.createTrigger();
  storyItemsManager.createAllObjectiveMarkers();

  const context: GameContext = {
    scene,
    camera,
    renderer,
    composer,
    cars,
    occupiedGrids,
    buildings,
    score,
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
    reportCheckpoint: () => {
      if (gameSessionId.value) {
        ScoreService.recordCheckpoint(gameSessionId.value);
      }
    },
    checkpointMesh,
    navArrow,
    chaseArrow,
    storyState,
    minimapData,
    updateObjective: updateStoryObjective,
    advanceDialogue: advanceStoryDialogue,
    dismissBriefing: dismissStoryBriefing,
    nearStoryTrigger,
    activateStoryTrigger,
  };
  gameModeManager = new GameModeManager(context, (type) => {
    isGameMode.value = type !== null;
    isDrivingMode.value = type === 'driving';
    isExplorationMode.value = type === 'exploration';
    isCinematicMode.value = type === 'cinematic';
    if (type !== null) {
      emit('game-start');
      if (multiplayerManager) {
        multiplayerManager.connect();
      }
    }
  });

  isActive = true;
  animate();
}

onMounted(() => {
  if (!canvasContainer.value) return;

  checkHdr();

  const width = canvasContainer.value.clientWidth || window.innerWidth;
  const height = canvasContainer.value.clientHeight || window.innerHeight;

  initScene(width, height);
  initRenderer(width, height);

  const doDeferredInit = () => {
    if (deferredInitCancelled) return;
    initGameWorld();
    skyEffects.setStarTwinkleEnabled(browserQuality.starTwinkleEnabled);
    initTrafficAndSparks();
    initGameManagers();
    initEventListeners();
    initStoryAndMode();

    ScoreService.getTopScores()
      .then((scores) => {
        leaderboard.value = scores;
        if (leaderboardCanvas && leaderboardTexture) {
          drawLeaderboard(leaderboardCanvas, leaderboardTexture, leaderboard.value);
        }
      })
      .catch(() => {
        // Scores failed to load, leaderboard stays empty
      });

    cyberpunkAudio.addListener(onAudioNote);
    showSplash.value = false;
  };

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(doDeferredInit, { timeout: 3000 });
  } else {
    setTimeout(doDeferredInit, 100);
  }
});

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    exitGameMode();
    return;
  }
  konamiManager.onKeyDown(event);
  gameModeManager.onKeyDown(event);
  if (isGameMode.value && !isGameOver.value) {
    event.preventDefault();
  }
}

function onKeyUp(event: KeyboardEvent) {
  gameModeManager.onKeyUp(event);
  if (isGameMode.value && !isGameOver.value) {
    event.preventDefault();
  }
}

watch(
  () => storyState.value.currentMissionIndex,
  (newIdx) => {
    storyItemsManager?.setCurrentMission(newIdx);
  }
);

watch(showSplash, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    startTime.value = Date.now();
  }
});

watch(activeCar, (newCar, oldCar) => {
  if (oldCar) trafficSystem.removeLightsFromCar(oldCar);
  if (newCar) trafficSystem.addLightsToCar(newCar);
});

function startExplorationMode() {
  if (isFallbackMode.value) return;
  gameModeManager.setMode(new ExplorationMode(), 'exploration');
}

function startStoryMode() {
  if (isFallbackMode.value) return;
  gameModeManager.setMode(new ExplorationMode(), 'exploration');
  storyManager.start();
}

async function startDemoMode() {
  if (isFallbackMode.value) return;
  const ok = await epilepsyConfirm(t('epilepsy.warning'));
  if (!ok) return;
  audioManager.photosensitivityConfirmed = true;
  gameModeManager.setMode(new DemoMode(), 'demo');
}

defineExpose({ startExplorationMode, startDemoMode, startStoryMode });

function exitGameMode() {
  gameModeManager.clearMode();

  if (storyManager) {
    storyManager.stop();
  }

  if (multiplayerManager) {
    multiplayerManager.disconnect();
  }

  isGameOver.value = false;
  score.value = 0;
  drivingScore.value = 0;
  gameSessionId.value = null;
  emit('game-end');
}

function onResize() {
  if (!renderer || !camera) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  // On mobile, ignore vertical resizes caused by address bar appearing/disappearing
  if (isMobile.value && width === lastWidth) {
    return;
  }

  lastWidth = width;

  const containerWidth = canvasContainer.value?.clientWidth || width;
  const containerHeight = canvasContainer.value?.clientHeight || height;

  camera.aspect = containerWidth / containerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(containerWidth, containerHeight);
  if (composer) {
    composer.setSize(containerWidth, containerHeight);
  }
  isMobile.value = checkMobile();
}

const cyberpunkClick = useCyberpunkClick({
  get camera() {
    return camera;
  },
  get scene() {
    return scene;
  },
  get cars() {
    return cars;
  },
  get gangWarManager() {
    return gangWarManager!;
  },
  get gameModeManager() {
    return gameModeManager!;
  },
  get leaderboardMeshes() {
    return leaderboardMeshes;
  },
  isGameMode,
  isDrivingMode,
  isCinematicMode,
  cinematicTarget,
  emit: (e: string, ...args: unknown[]) => emit(e as 'game-start', ...args),
  gameSessionId,
  activeCar,
});

function onClick(event: MouseEvent) {
  if (!camera) return;
  gameModeManager.onClick(event);
  if (isGameMode.value || isDrivingMode.value) return;
  const result = cyberpunkClick.handleClick(event);
  if (result.hitLeaderboard) {
    showLeaderboard.value = true;
  }
}

function onMouseMove(event: MouseEvent) {
  gameModeManager.onMouseMove(event);
}

const { playPewSound, onAudioNote } = useGameAudio(
  () => camera,
  () => cityBuilder,
  () => audioManager.photosensitivityConfirmed
);

const { checkLowFps } = useFallbackMode({
  renderer: () => renderer,
  composer: () => composer,
  scene: () => scene,
  camera: () => camera,
  canvasContainer,
  isFallbackMode,
  startTime,
  emitFallback: () => emit('fallback'),
  cleanup: () => {
    exitGameMode();
    isActive = false;
    cancelAnimationFrame(animationId);
    if (konamiManager) konamiManager.dispose();
    if (gangWarManager) gangWarManager.dispose();
    if (multiplayerManager) multiplayerManager.dispose();
    if (skyEffects?.dispose) skyEffects.dispose();
    renderer.dispose();
    carAudio.stop();
    cyberpunkAudio.removeListener(onAudioNote);
    cyberpunkAudio.dispose();
    sparkSystem.dispose();
    if (cityBuilder) cityBuilder.dispose();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('click', onClick);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('mousemove', onMouseMove);
  },
});

function updateMultiplayer(dt: number) {
  if (!multiplayerManager) return;
  multiplayerManager.update(dt);
  if (isExplorationMode.value) {
    multiplayerManager.broadcast(
      camera.position.x,
      camera.position.y,
      camera.position.z,
      camera.rotation.y,
      'walking'
    );
  } else if (isDrivingMode.value && activeCar.value) {
    const heading = activeCar.value.userData.heading ?? activeCar.value.rotation.y;
    multiplayerManager.broadcast(
      activeCar.value.position.x,
      activeCar.value.position.y,
      activeCar.value.position.z,
      heading,
      'driving'
    );
  }
}

function updateSignalStrength() {
  if (
    isExplorationMode.value &&
    !storyState.value.active &&
    !storyItemsManager?.isTriggerHidden()
  ) {
    const dx = camera.position.x - STORY_TRIGGER_POSITION.x;
    const dz = camera.position.z - STORY_TRIGGER_POSITION.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    signalStrength.value = Math.max(0, Math.min(1, 1 - dist / 1500));
    if (signalStrength.value > 0.05 && !showStoryHint.value) {
      showStoryHint.value = true;
    }
  } else {
    signalStrength.value = 0;
  }
}

function updateCityMaterials() {
  if (!cityBuilder) return;
  const materials = cityBuilder.getAudioMaterials();
  for (const key in materials) {
    const mat = materials[key];
    if (mat.emissiveIntensity > EMISSIVE_INTENSITY_TARGET) {
      mat.emissiveIntensity = MathUtils.lerp(
        mat.emissiveIntensity,
        EMISSIVE_INTENSITY_TARGET,
        EMISSIVE_LERP_FACTOR
      );
    }
  }
}

function updateSparks() {
  if (sparkSystem) {
    sparkSystem.update(occupiedGrids);
  }
}

function updateCamera(time: number, now: number) {
  if (gameModeManager.getMode()) return;

  if (isCinematicMode.value) {
    const angle = time * INTRO_ORBIT_SPEED;
    const tx = cinematicTarget.x + Math.sin(angle) * INTRO_ORBIT_RADIUS;
    const tz = cinematicTarget.z + Math.cos(angle) * INTRO_ORBIT_RADIUS;
    camera.position.x += (tx - camera.position.x) * CAMERA_LERP_FACTOR;
    camera.position.z += (tz - camera.position.z) * CAMERA_LERP_FACTOR;
    camera.position.y += (CAMERA_CINEMATIC_Y - camera.position.y) * CAMERA_LERP_FACTOR;
    currentLookAt.lerp(cinematicTarget, CAMERA_LERP_FACTOR);
    camera.lookAt(currentLookAt);
    return;
  }

  const orbitRadius = ORBIT_RADIUS_DESKTOP;
  const targetY = CAMERA_TARGET_Y_DESKTOP;
  const introProgress =
    startTime.value === 0 ? 0 : Math.min(1, (now - startTime.value) / INTRO_DURATION_MS);

  camera.position.x = Math.sin(time * ORBIT_SPEED) * orbitRadius;
  camera.position.z = Math.cos(time * ORBIT_SPEED) * orbitRadius;

  if (startTime.value === 0) {
    camera.position.y = CAMERA_START_Y;
  } else if (introProgress < 1) {
    const ease = 1 - Math.pow(1 - introProgress, 3);
    camera.position.y = CAMERA_START_Y + (targetY - CAMERA_START_Y) * ease;
  } else if (Math.abs(camera.position.y - targetY) > 1) {
    camera.position.y += (targetY - camera.position.y) * CAMERA_LERP_FACTOR;
  }

  currentLookAt.lerp(ZERO_VEC, CAMERA_LOOK_AT_LERP);
  camera.lookAt(currentLookAt);
}

function renderFrame() {
  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

let tickCounter = 0;

function animate() {
  if (!isActive) return;
  animationId = requestAnimationFrame(animate);

  const now = Date.now();
  const time = now * 0.0005;
  const dt = (now - lastTime.value) / 1000;
  lastTime.value = now;

  if (checkLowFps(now)) return;
  tickCounter++;

  konamiManager.update(dt);
  gangWarManager.update(dt);
  skyEffects.update(dt);
  gameModeManager.update(dt, time);
  trafficSystem.update(activeCar.value);
  storyItemsManager?.updateTriggerAnimation(time * 1000);

  updateCamera(time, now);
  renderFrame();

  if (tickCounter % 3 === 0) {
    updateMultiplayer(dt);
    updateCityMaterials();
  }

  if (tickCounter % 2 === 0) {
    updateSignalStrength();
    updateSparks();
  }
}

onBeforeUnmount(() => {
  cyberpunkAudio.removeListener(onAudioNote);
  isActive = false;
  deferredInitCancelled = true;
  window.removeEventListener('resize', onResize);
  window.removeEventListener('click', onClick);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  window.removeEventListener('mousemove', onMouseMove);

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
  if (multiplayerManager) {
    multiplayerManager.dispose();
  }
  if (skyEffects && skyEffects.dispose) {
    skyEffects.dispose();
  }
  if (storyItemsManager) {
    storyItemsManager.dispose();
    storyItemsManager = null;
  }
  if (cityBuilder) cityBuilder.dispose();
});
</script>

<style scoped>
#cyberpunk-city-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  height: 100lvh;
  z-index: -1;
  transform: translateZ(0);
  backface-visibility: hidden;
  contain: paint layout;
}

#cyberpunk-city {
  width: 100%;
  height: 100%;
}

.glitch-fade-leave-active {
  animation: glitch-fade-out 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes glitch-fade-out {
  0% {
    opacity: 1;
    transform: translate(0);
    clip-path: inset(0 0 0 0);
  }
  10% {
    opacity: 1;
    transform: translate(-2px, 2px);
    clip-path: inset(10% 0 80% 0);
  }
  20% {
    opacity: 1;
    transform: translate(2px, -2px);
    clip-path: inset(80% 0 10% 0);
  }
  30% {
    opacity: 1;
    transform: translate(-2px, 2px);
    clip-path: inset(10% 0 80% 0);
  }
  40% {
    opacity: 1;
    transform: translate(2px, -2px);
    clip-path: inset(80% 0 10% 0);
  }
  50% {
    opacity: 1;
    transform: translate(-2px, 2px);
    clip-path: inset(10% 0 80% 0);
  }
  60% {
    opacity: 1;
    transform: translate(2px, -2px);
    clip-path: inset(80% 0 10% 0);
  }
  70% {
    opacity: 1;
    transform: translate(-2px, 2px);
    clip-path: inset(10% 0 80% 0);
  }
  80% {
    opacity: 1;
    transform: translate(2px, -2px);
    clip-path: inset(80% 0 10% 0);
  }
  90% {
    opacity: 1;
    transform: translate(-2px, 2px);
    clip-path: inset(10% 0 80% 0);
  }
  100% {
    opacity: 0;
    transform: translate(0);
    clip-path: inset(0 0 0 0);
  }
}

#online-indicator {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 30;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #00ffcc;
  background: rgba(5, 5, 20, 0.75);
  border: 1px solid rgba(0, 255, 204, 0.3);
  padding: 4px 8px;
  pointer-events: none;
  text-shadow: 0 0 6px rgba(0, 255, 204, 0.4);
  box-shadow: 0 0 8px rgba(0, 255, 204, 0.15);
  display: flex;
  align-items: center;
  gap: 6px;
}

#online-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00ffcc;
  box-shadow: 0 0 6px #00ffcc;
  animation: online-pulse 2s ease-in-out infinite;
}

@keyframes online-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

#hdr-badge {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 30;
  font-family: 'Courier New', Courier, monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #00ffcc;
  background: rgba(5, 5, 20, 0.75);
  border: 1px solid rgba(0, 255, 204, 0.3);
  padding: 4px 8px;
  pointer-events: none;
  text-shadow: 0 0 6px rgba(0, 255, 204, 0.4);
  box-shadow: 0 0 8px rgba(0, 255, 204, 0.15);
}
</style>
