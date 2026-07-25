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
import { setupPostProcessing } from '../game/PostProcessingManager';
import { StoryState, MinimapData } from '../game/types';
import { carAudio } from '../game/audio/CarAudio';
import { cyberpunkAudio } from '../utils/CyberpunkAudio';
import { CELL_SIZE, START_OFFSET, GRID_SIZE } from '../game/config';
import {
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
import { STORY_TRIGGER_POSITION } from '../game/StoryItemsManager';
import { KonamiManager } from '../game/KonamiManager';
import { CityBuilder } from '../game/CityBuilder';
import { SkyEffects } from '../game/SkyEffects';
import { getHeight } from '../utils/HeightMap';
import { audioManager } from '../utils/AudioManager';
import { getBrowserQuality, isMobile as checkMobile } from '../utils/BrowserDetect';
import { drawLeaderboard, createLeaderboardCanvas } from '../utils/LeaderboardRenderer';
import { SparkSystem } from '../utils/SparkSystem';
import { useI18n } from 'vue-i18n';
import { useEpilepsyWarning } from '../composables/useEpilepsyWarning';
import { PagePanelRenderer } from '../game/PagePanelRenderer';
import { useTranslatedPages } from '../composables/useTranslatedPages';

const { t } = useI18n();
const { confirm: epilepsyConfirm } = useEpilepsyWarning();
const { translatedPages } = useTranslatedPages();
import { useHdrDisplay } from '../composables/useHdrDisplay';
import { useCyberpunkClick } from '../composables/useCyberpunkClick';
import { useGameAudio } from '../composables/useGameAudio';
import { useFallbackMode } from '../composables/useFallbackMode';

// Import the new ECS-based game system
import { createGameECS } from '../ecs/GameECS';

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
let pagePanelRenderer: PagePanelRenderer;
let pageMeshes: Mesh[] = [];

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
let konamiManager: KonamiManager;
let cityBuilder: CityBuilder;
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

function updateStoryObjective(_missionIdx: number, _objIdx: number) {
  // Handled by ECS StorySystem
}

function advanceStoryDialogue() {
  // Handled by ECS StorySystem
}

function dismissStoryBriefing() {
  // Handled by ECS StorySystem
}

function isStoryTriggerHidden(): boolean {
  return false;
}

function activateStoryTrigger() {
  if (isFallbackMode.value) return;
  if (!isGameMode.value) {
    gameECS.setMode('exploration');
  }
  // Story is auto-started by ECS
  nearStoryTrigger.value = false;
}

// Local function for ECS context - actual sound handled by ECS
function playPewSound() {
  // Handled by ECS
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

const emit = defineEmits(['game-start', 'game-end', 'fallback', 'navigate']);
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

// ECS Game System
let gameECS: ReturnType<typeof createGameECS>;

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
      color: 0x888800,
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

async function initGameWorld() {
  skyEffects = new SkyEffects(scene);

  const lbTexture = createLeaderboardTexture();
  cityBuilder = new CityBuilder(scene);
  await cityBuilder.buildCity(isMobile.value, lbTexture);
  buildings = cityBuilder.getBuildings();
  occupiedGrids = cityBuilder.getOccupiedGrids();

  buildings.forEach((b) => {
    b.traverse((c) => {
      if (c instanceof Mesh && c.userData.isLeaderboard) {
        leaderboardMeshes.push(c);
      }
    });
  });

  pagePanelRenderer = new PagePanelRenderer(scene);
  const displayPages = translatedPages.value.filter((p) => !p.hidden);
  pagePanelRenderer.createPanels(displayPages);
  pageMeshes = pagePanelRenderer.getPageMeshes();
}

function initTrafficAndSparks() {
  // Traffic is now handled by ECS TrafficSystem
  sparkSystem = new SparkSystem(scene);
}

function initGameManagers() {
  konamiManager = new KonamiManager(scene);

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
  createCheckpoint();
  createNavArrow();
  createChaseArrow();

  gameECS = createGameECS(
    {
      scene,
      camera,
      renderer,
      composer,
      cars,
      buildings,
      occupiedGrids,
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
    },
    carAudio
  );
}

onMounted(() => {
  if (!canvasContainer.value) return;

  checkHdr();

  const width = canvasContainer.value.clientWidth || window.innerWidth;
  const height = canvasContainer.value.clientHeight || window.innerHeight;

  initScene(width, height);
  initRenderer(width, height);

  const doDeferredInit = async () => {
    if (deferredInitCancelled) return;
    await initGameWorld();
    skyEffects.setStarTwinkleEnabled(browserQuality.starTwinkleEnabled);

    // Initialize remaining systems while city is visible
    initTrafficAndSparks();

    // Start rendering the scene immediately
    initEventListeners();
    isActive = true;
    animate();

    initGameManagers();
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
  gameECS.onKeyDown(event);
  if (isGameMode.value && !isGameOver.value) {
    event.preventDefault();
  }
}

function onKeyUp(event: KeyboardEvent) {
  gameECS.onKeyUp(event);
  if (isGameMode.value && !isGameOver.value) {
    event.preventDefault();
  }
}

watch(
  () => storyState.value.currentMissionIndex,
  (_newIdx) => {
    // Story items handled by ECS
  }
);

watch(showSplash, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    startTime.value = Date.now();
  }
});

watch(activeCar, (_newCar, _oldCar) => {
  // ECS TrafficSystem handles car lights internally
});

function startExplorationMode() {
  if (isFallbackMode.value) return;
  gameECS.setMode('exploration');
}

function startStoryMode() {
  if (isFallbackMode.value) return;
  gameECS.setMode('exploration');
  // Story auto-starts in exploration mode
}

async function startDemoMode() {
  if (isFallbackMode.value) return;
  const ok = await epilepsyConfirm(t('epilepsy.warning'));
  if (!ok) return;
  audioManager.photosensitivityConfirmed = true;
  gameECS.setMode('demo');
}

defineExpose({ startExplorationMode, startDemoMode, startStoryMode });

function exitGameMode() {
  gameECS.clearMode();

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
    return gameECS.getWorld().resources.gangWarCombat;
  },
  startDrivingMode: () => gameECS.setMode('driving'),
  get leaderboardMeshes() {
    return leaderboardMeshes;
  },
  get pageMeshes() {
    return pageMeshes;
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
  const target = event.target as HTMLElement;
  if (target.closest('.app-header')) return;
  if (target.closest('.playground-container')) return;
  gameECS.onClick(event);
  if (isGameMode.value || isDrivingMode.value) return;
  const result = cyberpunkClick.handleClick(event);
  if (result.hitLeaderboard) {
    showLeaderboard.value = true;
  }
  if (result.hitPagePanel && result.pageLink) {
    emit('navigate', result.pageLink);
  }
}

function onMouseMove(event: MouseEvent) {
  gameECS.onMouseMove(event);
}

const { onAudioNote } = useGameAudio(
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
    if (gameECS) gameECS.dispose();
    if (skyEffects?.dispose) skyEffects.dispose();
    renderer.dispose();
    carAudio.stop();
    cyberpunkAudio.removeListener(onAudioNote);
    cyberpunkAudio.dispose();
    sparkSystem.dispose();
    if (cityBuilder) cityBuilder.dispose();
    pagePanelRenderer?.dispose();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('click', onClick);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('mousemove', onMouseMove);
  },
});

function updateMultiplayer(_dt: number) {
  // Handled by ECS
}

function updateSignalStrength() {
  if (
    isExplorationMode.value &&
    !storyState.value.active &&
    !isStoryTriggerHidden()
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
  if (!gameECS || gameECS.getWorld().resources.gameMode.currentMode) return;

  if (isCinematicMode.value) {
    const angle = time * INTRO_ORBIT_SPEED;
    const tx = cinematicTarget.x + Math.sin(angle) * INTRO_ORBIT_RADIUS;
    const tz = cinematicTarget.z + Math.cos(angle) * INTRO_ORBIT_RADIUS;
    camera.position.x += (tx - camera.position.x) * CAMERA_LERP_FACTOR;
    camera.position.z += (tz - camera.position.z) * CAMERA_LERP_FACTOR;
    camera.position.y += (CAMERA_CINEMATIC_Y - camera.position.y) * CAMERA_LERP_FACTOR;
    currentLookAt.lerp(cinematicTarget, CAMERA_LOOK_AT_LERP);
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

  if (tickCounter === 1) {
    skyEffects?.addClouds();
    cityBuilder?.enableAllShadowMaps();
  }

  konamiManager?.update(dt);
  skyEffects.update(dt);
  // ECS systems run via GameECS
  // gameECS runs its own internal loop
  // trafficSystem?.update(activeCar.value);
  // storyItemsManager?.updateTriggerAnimation(time * 1000);
  pagePanelRenderer?.update(now);

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
  if (gameECS) {
    gameECS.dispose();
  }
  if (skyEffects?.dispose) skyEffects.dispose();
  renderer.dispose();
  carAudio.stop();
  cyberpunkAudio.removeListener(onAudioNote);
  cyberpunkAudio.dispose();
  sparkSystem.dispose();
  if (cityBuilder) cityBuilder.dispose();
  pagePanelRenderer?.dispose();
  window.removeEventListener('resize', onResize);
  window.removeEventListener('click', onClick);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  window.removeEventListener('mousemove', onMouseMove);
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