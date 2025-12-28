<template>
  <div ref="canvasContainer" id="cyberpunk-city"></div>
  <div v-if="(isDrivingMode ? drivingScore : droneScore) > 0" id="score-counter">SCORE: {{ isDrivingMode ? drivingScore : droneScore }}</div>
  <div v-if="isDrivingMode" id="timer-counter">
    TIME: {{ Math.ceil(timeLeft) }}
  </div>
  <div v-if="isDrivingMode" id="dist-counter">
    DIST: {{ Math.ceil(distToTarget) }}m
  </div>
  <div v-if="isDrivingMode && isGameOver" id="game-over">
    <div class="game-over-title">GAME OVER</div>
    <div class="final-score">SCORE: {{ drivingScore }}</div>

    <div v-if="!isScoreSubmitted" class="score-form">
      <input 
        v-model="playerName" 
        placeholder="ENTER NAME" 
        maxlength="8" 
        @keyup.enter="submitHighScore"
        class="name-input"
        autofocus
      />
      <button @click="submitHighScore" class="submit-btn">SUBMIT</button>
    </div>

    <div class="leaderboard">
      <div class="lb-header">TOP DRIVERS</div>
      <div v-for="(entry, index) in leaderboard" :key="index" class="lb-row">
        <span class="lb-name">{{ index + 1 }}. {{ entry.name }}</span>
        <span class="lb-score">{{ entry.score }}</span>
      </div>
    </div>
  </div>
  <button
    v-if="isGameMode || isDrivingMode || isExplorationMode || isFlyingTour"
    id="return-button"
    @click="exitGameMode"
  >
    RETURN
  </button>

  <div v-if="isDrivingMode" id="driving-controls">
    <div class="control-group left">
      <button
        class="control-btn"
        @mousedown="controls.left = true"
        @mouseup="controls.left = false"
        @mouseleave="controls.left = false"
        @touchstart.prevent="controls.left = true"
        @touchend.prevent="controls.left = false"
      >
        ←
      </button>
      <button
        class="control-btn"
        @mousedown="controls.right = true"
        @mouseup="controls.right = false"
        @mouseleave="controls.right = false"
        @touchstart.prevent="controls.right = true"
        @touchend.prevent="controls.right = false"
      >
        →
      </button>
    </div>
    <div class="control-group right">
      <button
        class="control-btn"
        @mousedown="controls.backward = true"
        @mouseup="controls.backward = false"
        @mouseleave="controls.backward = false"
        @touchstart.prevent="controls.backward = true"
        @touchend.prevent="controls.backward = false"
      >
        BRK
      </button>
      <button
        class="control-btn"
        @mousedown="controls.forward = true"
        @mouseup="controls.forward = false"
        @mouseleave="controls.forward = false"
        @touchstart.prevent="controls.forward = true"
        @touchend.prevent="controls.forward = false"
      >
        GAS
      </button>
    </div>
  </div>

  <div v-if="isExplorationMode && isMobile" id="exploration-controls">
    <div class="control-group left">
      <div class="dpad">
        <button
          class="dpad-btn up"
          @touchstart.prevent="controls.forward = true"
          @touchend.prevent="controls.forward = false"
        >
          W
        </button>
        <button
          class="dpad-btn left"
          @touchstart.prevent="controls.left = true"
          @touchend.prevent="controls.left = false"
        >
          A
        </button>
        <button
          class="dpad-btn right"
          @touchstart.prevent="controls.right = true"
          @touchend.prevent="controls.right = false"
        >
          D
        </button>
        <button
          class="dpad-btn down"
          @touchstart.prevent="controls.backward = true"
          @touchend.prevent="controls.backward = false"
        >
          S
        </button>
      </div>
    </div>
    <div class="control-group right">
      <div class="dpad">
        <button
          class="dpad-btn up"
          @touchstart.prevent="lookControls.up = true"
          @touchend.prevent="lookControls.up = false"
        >
          ↑
        </button>
        <button
          class="dpad-btn left"
          @touchstart.prevent="lookControls.left = true"
          @touchend.prevent="lookControls.left = false"
        >
          ←
        </button>
        <button
          class="dpad-btn right"
          @touchstart.prevent="lookControls.right = true"
          @touchend.prevent="lookControls.right = false"
        >
          →
        </button>
        <button
          class="dpad-btn down"
          @touchstart.prevent="lookControls.down = true"
          @touchend.prevent="lookControls.down = false"
        >
          ↓
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { ScoreService, type ScoreEntry } from "../utils/ScoreService";
import {
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  FogExp2,
  Group,
  InterleavedBufferAttribute,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  NearestFilter,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Raycaster,
  RepeatWrapping,
  Scene,
  SpotLight,
  Vector2,
  Vector3,
  WebGLRenderer,
  Euler,
  Quaternion,
  CylinderGeometry,
  ConeGeometry,
} from "three";
import { GameModeManager } from "../game/GameModeManager";
import { DrivingMode } from "../game/modes/DrivingMode";
import { DroneMode } from "../game/modes/DroneMode";
import { ExplorationMode } from "../game/modes/ExplorationMode";
import { FlyingTourMode } from "../game/modes/FlyingTourMode";
import { GameContext } from "../game/types";
import { carAudio } from "../game/audio/CarAudio";
import { BOUNDS, CELL_SIZE, START_OFFSET, CITY_SIZE, BLOCK_SIZE, ROAD_WIDTH, GRID_SIZE, DRONE_COUNT } from "../game/config";
import { KonamiManager } from "../game/KonamiManager";

const canvasContainer = ref<HTMLDivElement | null>(null);

let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let animationId: number;
let isActive = false;

const buildings: Object3D[] = [];
const occupiedGrids = new Map<string, { halfW: number; halfD: number }>();
const cars: Group[] = [];

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
const isTransitioning = ref(false);
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

const leaderboard = ref<ScoreEntry[]>([]);
const playerName = ref("");
const isScoreSubmitted = ref(false);

watch(isGameOver, async (val) => {
  if (val && isDrivingMode.value) {
    isScoreSubmitted.value = false;
    leaderboard.value = await ScoreService.getTopScores();
  }
});

let leaderboardCanvas: HTMLCanvasElement;
let leaderboardTexture: CanvasTexture;

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
      ctx.fillStyle = "#ffffff";
      if (idx === 0) ctx.fillStyle = "#ffff00"; // Gold
      else if (idx === 1) ctx.fillStyle = "#cccccc"; // Silver
      else if (idx === 2) ctx.fillStyle = "#cd7f32"; // Bronze

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

async function submitHighScore() {
  if (!playerName.value.trim()) return;
  const nameUpper = playerName.value.trim().toUpperCase();
  // Assume leaderboard mainly tracks driving score for now, or use relevant score
  const finalScore = isDrivingMode.value ? drivingScore.value : score.value;
  leaderboard.value = await ScoreService.submitScore(nameUpper, finalScore);
  isScoreSubmitted.value = true;
}

const isMobile = ref(false);

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
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

const isJumping = ref(false);
let velocityY = 0;
const gravity = 0.015;
const jumpStrength = 0.4;
const groundPosition = 1.8;

const playerRotation = new Euler(0, 0, 0, "YXZ");

// Car Audio System removed (extracted to src/game/audio/CarAudio.ts)

const emit = defineEmits(["game-start", "game-end"]);

const currentLookAt = new Vector3(0, 0, 0);

const raycaster = new Raycaster();
const pointer = new Vector2();

// Sparks system
let sparks: Points;
const sparkCount = 2000;
const sparkPositions = new Float32Array(sparkCount * 3);
const sparkVelocities = new Float32Array(sparkCount * 3);
const sparkLifetimes = new Float32Array(sparkCount); // 0 = dead, 1 = full life

const route = useRoute();

// Configuration is imported from ../game/config
// OLD CONSTANTS REMOVED
const CAR_COUNT = 150;

// Function to reset/spawn a car
function addLightsToCar(car: Group) {
  // Headlights
  const hlColor = 0xffffaa;
  const hlIntensity = 2000;
  const hlDist = 800;
  const hlAngle = Math.PI / 4.5; // Narrower angle to prevent reaching too high
  const hlPenumbra = 0.2;

  const hl1 = new SpotLight(
    hlColor,
    hlIntensity,
    hlDist,
    hlAngle,
    hlPenumbra,
    1,
  );
  hl1.position.set(1.5, 2, 4);
  hl1.castShadow = false;

  // Target for headlight 1 (angled down to hit ground closer)
  const hl1Target = new Object3D();
  hl1Target.position.set(1.5, -10, 40);
  car.add(hl1Target);
  hl1.target = hl1Target;

  hl1.userData.isCarLight = true;
  car.add(hl1);

  const hl2 = new SpotLight(
    hlColor,
    hlIntensity,
    hlDist,
    hlAngle,
    hlPenumbra,
    1,
  );
  hl2.position.set(-1.5, 2, 4);
  hl2.castShadow = false;

  // Target for headlight 2
  const hl2Target = new Object3D();
  hl2Target.position.set(-1.5, -10, 40);
  car.add(hl2Target);
  hl2.target = hl2Target;

  hl2.userData.isCarLight = true;
  car.add(hl2);

  // Taillights
  const tlColor = 0xff0000;
  const tlIntensity = 150; // Reduced intensity
  const tlDist = 50;
  const tlAngle = Math.PI / 2.5;

  const tl1 = new SpotLight(tlColor, tlIntensity, tlDist, tlAngle, 0.5, 1);
  tl1.position.set(1.5, 2, -4);

  const tl1Target = new Object3D();
  tl1Target.position.set(1.5, -5, -20);
  car.add(tl1Target);
  tl1.target = tl1Target;

  tl1.userData.isCarLight = true;
  car.add(tl1);

  const tl2 = new SpotLight(tlColor, tlIntensity, tlDist, tlAngle, 0.5, 1);
  tl2.position.set(-1.5, 2, -4);

  const tl2Target = new Object3D();
  tl2Target.position.set(-1.5, -5, -20);
  car.add(tl2Target);
  tl2.target = tl2Target;

  tl2.userData.isCarLight = true;
  car.add(tl2);
}

function removeLightsFromCar(car: Group) {
  const lightsToRemove: Object3D[] = [];
  const targetsToRemove: Object3D[] = [];

  car.traverse((child) => {
    if (child.userData.isCarLight) {
      lightsToRemove.push(child);
      if (child instanceof SpotLight) {
        targetsToRemove.push(child.target);
      }
    }
  });

  lightsToRemove.forEach((l) => {
    car.remove(l);
    if (l instanceof SpotLight) {
      l.dispose();
    }
  });

  targetsToRemove.forEach((t) => car.remove(t));
}

function resetCar(carGroup: Group) {
  const wasActive = activeCar.value && carGroup.uuid === activeCar.value.uuid;

  // Ensure lights are removed if recycled
  removeLightsFromCar(carGroup);

  const axis = Math.random() > 0.5 ? "x" : "z";
  const dir = Math.random() > 0.5 ? 1 : -1;

  const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
  const roadCoordinate = START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;

  const laneOffset = (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

  let x = 0,
    z = 0;

  if (axis === "x") {
    z = roadCoordinate + laneOffset;
    x = (Math.random() - 0.5) * CITY_SIZE;
    carGroup.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
  } else {
    x = roadCoordinate + laneOffset;
    z = (Math.random() - 0.5) * CITY_SIZE;
    carGroup.rotation.y = dir === 1 ? 0 : Math.PI;
  }

  carGroup.position.set(x, 1, z);

  // Slower speed for easier clicking: 0.5 to 1.5
  carGroup.userData.speed = 0.5 + Math.random() * 1.0;
  carGroup.userData.dir = dir;
  carGroup.userData.axis = axis;
  carGroup.userData.laneOffset = laneOffset;
  carGroup.userData.collided = false;
  carGroup.userData.fading = false;
  carGroup.userData.isPlayerHit = false;
  carGroup.userData.opacity = 1.0;
  carGroup.userData.isPlayerControlled = false;
  carGroup.userData.currentSpeed = 0;

  carGroup.visible = true;

  // Reset opacity of children
  carGroup.traverse((child) => {
    if (child instanceof Mesh) {
      const mat = child.material;
      if (!Array.isArray(mat) && child.userData.originalOpacity !== undefined) {
        mat.opacity = child.userData.originalOpacity;
      }
    }
  });

  if (wasActive) {
    addLightsToCar(carGroup);
  }
}

// Reusable Textures for Windows
function createWindowTextures() {
  const textures: CanvasTexture[] = [];

  // Style 1: Standard Scattered
  const c1 = document.createElement("canvas");
  c1.width = 64;
  c1.height = 128;
  const ctx1 = c1.getContext("2d");
  if (ctx1) {
    ctx1.fillStyle = "#000000";
    ctx1.fillRect(0, 0, 64, 128);
    for (let y = 4; y < 128; y += 8) {
      for (let x = 4; x < 64; x += 8) {
        if (Math.random() > 0.4) {
          // Increased probability
          ctx1.fillStyle = Math.random() > 0.5 ? "#ff00cc" : "#00ccff";
          ctx1.fillRect(x, y, 4, 4); // Larger windows
        }
      }
    }
  }
  const t1 = new CanvasTexture(c1);
  textures.push(t1);

  // Style 2: Vertical Stripes (Cyberpunk / Blade Runner)
  const c2 = document.createElement("canvas");
  c2.width = 64;
  c2.height = 128;
  const ctx2 = c2.getContext("2d");
  if (ctx2) {
    ctx2.fillStyle = "#050505";
    ctx2.fillRect(0, 0, 64, 128);
    for (let x = 8; x < 64; x += 16) {
      ctx2.fillStyle =
        Math.random() > 0.5
          ? "rgba(0, 255, 204, 0.8)" // More opaque
          : "rgba(255, 0, 204, 0.8)";
      ctx2.fillRect(x, 0, 4, 128);
      // Bright spots
      for (let y = 0; y < 128; y += 16) {
        if (Math.random() > 0.6) {
          ctx2.fillStyle = "#ffffff";
          ctx2.fillRect(x, y, 4, 8);
        }
      }
    }
  }
  const t2 = new CanvasTexture(c2);
  textures.push(t2);

  // Style 3: Dense Grid (Office)
  const c3 = document.createElement("canvas");
  c3.width = 64;
  c3.height = 128;
  const ctx3 = c3.getContext("2d");
  if (ctx3) {
    ctx3.fillStyle = "#000000";
    ctx3.fillRect(0, 0, 64, 128);
    ctx3.fillStyle = "#111111";
    ctx3.fillRect(4, 0, 56, 128);

    ctx3.fillStyle = "#000000";
    for (let y = 4; y < 128; y += 4) {
      ctx3.fillRect(0, y, 64, 2);
    }
    // Random lights
    for (let y = 4; y < 128; y += 4) {
      for (let x = 8; x < 56; x += 8) {
        if (Math.random() > 0.8) {
          ctx3.fillStyle = "#ffffaa";
          ctx3.fillRect(x, y, 4, 2);
        }
      }
    }
  }
  const t3 = new CanvasTexture(c3);
  textures.push(t3);

  textures.forEach((t) => {
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.magFilter = NearestFilter;
    t.anisotropy = 16; // Improve quality at angles
    t.needsUpdate = true;
  });

  return textures;
}

function createGroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#0a0a15"; // Base ground color
    ctx.fillRect(0, 0, 512, 512);

    // Road color (darker)
    ctx.fillStyle = "#050505";

    // Calculate relative road width on texture
    // CELL_SIZE = BLOCK_SIZE + ROAD_WIDTH
    // We want the road to be at the edges of the cell? Or center?
    // Let's assume texture represents ONE cell.
    // Center: Block. Edges: Road.

    const roadRatio = ROAD_WIDTH / CELL_SIZE; // approx 40/190 = 0.21
    const roadPx = 512 * roadRatio;
    const halfRoad = roadPx / 2;

    // Draw Cross Roads
    ctx.fillRect(0, 256 - halfRoad, 512, roadPx); // Horizontal
    ctx.fillRect(256 - halfRoad, 0, roadPx, 512); // Vertical

    // Road Lines (Dashed)
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);

    // Horizontal Line
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.lineTo(512, 256);
    ctx.stroke();

    // Vertical Line
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();

    // Stop lines / Intersection details?
    // Add subtle noise?
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    for (let i = 0; i < 100; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.magFilter = NearestFilter;
  texture.anisotropy = 16;
  return texture;
}

// Generate Billboard Textures
function createBillboardTextures() {
  const textures: CanvasTexture[] = [];
  for (let i = 0; i < 5; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Dark background
      ctx.fillStyle = "#100010";
      ctx.fillRect(0, 0, 128, 64);

      // Neon border
      const colors = ["#ff00cc", "#00ffcc", "#ffff00", "#ff0000", "#00ff00"];
      const color = colors[i % colors.length];

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 120, 56);

      // "Text" / Content
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;

      if (i === 0) {
        // Lines
        ctx.fillRect(15, 15, 80, 5);
        ctx.fillRect(15, 30, 60, 5);
        ctx.fillRect(15, 45, 90, 5);
      } else if (i === 1) {
        // Circles
        ctx.beginPath();
        ctx.arc(32, 32, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(32, 32, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.fillRect(64, 20, 40, 24);
      } else {
        // Random blocks
        for (let k = 0; k < 5; k++) {
          ctx.fillRect(
            10 + Math.random() * 100,
            10 + Math.random() * 40,
            10 + Math.random() * 20,
            5 + Math.random() * 10,
          );
        }
      }
    }
    const texture = new CanvasTexture(canvas);
    textures.push(texture);
  }
  return textures;
}

function createDroneTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 32, 32);

    // Drone body (Quadcopter silhouette)
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(28, 28);
    ctx.moveTo(28, 4);
    ctx.lineTo(4, 28);
    ctx.stroke();

    // Rotors
    ctx.fillStyle = "#444444";
    ctx.beginPath();
    ctx.arc(4, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(28, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, 28, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(28, 28, 3, 0, Math.PI * 2);
    ctx.fill();

    // Central Light (White, to be tinted by vertex color)
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(16, 16, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new CanvasTexture(canvas);
  return texture;
}

function createCheckpoint() {
  // A glowing neon pillar/ring
  const geo = new CylinderGeometry(25, 25, 1000, 32, 1, true); // Taller and wider
  const mat = new MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.6, // More opaque
    side: DoubleSide,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  checkpointMesh = new Mesh(geo, mat);
  checkpointMesh.visible = false;
  scene.add(checkpointMesh);

  // Inner brighter core
  const coreGeo = new CylinderGeometry(5, 5, 1000, 16);
  const coreMat = new MeshBasicMaterial({ color: 0xffffff });
  const core = new Mesh(coreGeo, coreMat);
  checkpointMesh.add(core);
}

function createNavArrow() {
  navArrow = new Group();

  // Cone pointing at target
  const cone = new Mesh(
    new ConeGeometry(2, 7.5, 16), // Quarter size
    new MeshBasicMaterial({
      color: 0xffff00,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      opacity: 0.9,
    }),
  );
  // Cone points +Y. We want it to point +Z (forward)
  cone.rotation.x = Math.PI / 2;

  navArrow.add(cone);

  // Make sure it renders on top
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
      opacity: 0.0, // Start invisible
    }),
  );
  cone.rotation.x = Math.PI / 2;
  cone.position.z = 25; // Offset from center (radius of 25)

  chaseArrow.add(cone);
  cone.renderOrder = 999;

  chaseArrow.visible = false;
  scene.add(chaseArrow);
}

function spawnCheckpoint() {
  // Pick random road coordinate
  const roadIndexX = Math.floor(Math.random() * (GRID_SIZE + 1));
  const roadIndexZ = Math.floor(Math.random() * (GRID_SIZE + 1));

  // We want the checkpoint to be on an intersection or road
  // Let's pick an intersection for simplicity, or just one axis road

  // Pick random axis
  const axis = Math.random() > 0.5 ? "x" : "z";
  const roadCoordinate =
    START_OFFSET +
    (axis === "x" ? roadIndexX : roadIndexZ) * CELL_SIZE -
    CELL_SIZE / 2;

  // Coordinate along the road.
  // Constrain to slightly less than city bounds to ensure it's reachable and not in void.
  // BOUNDS is where cars wrap, so let's use slightly less.
  const limit = (GRID_SIZE * CELL_SIZE) / 2;
  const otherCoord = (Math.random() - 0.5) * 2 * limit * 0.9;

  let x = 0,
    z = 0;
  if (axis === "x") {
    z = roadCoordinate; // Road runs along X at this Z
    x = otherCoord;
  } else {
    x = roadCoordinate; // Road runs along Z at this X
    z = otherCoord;
  }

  checkpointMesh.position.set(x, 0, z);
  checkpointMesh.visible = true;
}

function spawnSparks(position: Vector3) {
  if (!sparks) return;
  const posAttribute = sparks.geometry.attributes.position;

  // Spawn a burst of sparks
  let spawned = 0;
  const burstSize = 30; // Increased burst size

  // First pass: try to find dead sparks
  for (let i = 0; i < sparkCount; i++) {
    if (sparkLifetimes[i] <= 0) {
      activateSpark(i, position, posAttribute);
      spawned++;
      if (spawned >= burstSize) break;
    }
  }

  // Second pass: if not enough spawned, recycle random sparks
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
  posAttribute: BufferAttribute | InterleavedBufferAttribute,
) {
  sparkLifetimes[i] = 1.0;

  // Set position
  posAttribute.setXYZ(i, position.x, position.y, position.z);

  // Random velocity
  sparkVelocities[i * 3] = (Math.random() - 0.5) * 5; // vx
  sparkVelocities[i * 3 + 1] = Math.random() * 5 + 2; // vy (upwards)
  sparkVelocities[i * 3 + 2] = (Math.random() - 0.5) * 5; // vz
}

onMounted(() => {
  if (!canvasContainer.value) return;

  updateIsMobile();

  // Scene setup
  scene = new Scene();
  scene.background = new Color(0x050510);
  scene.fog = new FogExp2(0x050510, isMobile.value ? 0.00057 : 0.001); // Reduced fog density

  // Camera setup
  camera = new PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    3000,
  );
  camera.position.set(0, 250, 600); // Lowered camera slightly
  camera.lookAt(0, 0, 0);

  // Renderer setup
  renderer = new WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasContainer.value.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const dirLight = new DirectionalLight(0xff00cc, 0.5);
  dirLight.position.set(100, 200, 100);
  scene.add(dirLight);

  const dirLight2 = new DirectionalLight(0x00ccff, 0.5);
  dirLight2.position.set(-100, 200, -100);
  scene.add(dirLight2);

  // Ground Plane
  const groundTexture = createGroundTexture();
  const planeGeometry = new PlaneGeometry(CITY_SIZE * 2, CITY_SIZE * 2);

  // Calculate repetitions based on city size vs cell size
  // CITY_SIZE * 2 covers -2000 to 2000 range approx (4000 total)
  // CELL_SIZE is 190.
  // We want texture to repeat every CELL_SIZE units.
  const repeatCount = (CITY_SIZE * 2) / CELL_SIZE;
  groundTexture.repeat.set(repeatCount, repeatCount);

  // Using MeshStandardMaterial to allow light casting from car headlights
  const planeMaterial = new MeshStandardMaterial({
    color: 0xffffff, // White to show texture colors
    map: groundTexture,
    roughness: 0.8,
    metalness: 0.2,
  });
  const plane = new Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.5;
  scene.add(plane);

  // Generate City Grid
  const windowTextures = createWindowTextures();
  const billboardTextures = createBillboardTextures();
  const lbTexture = createLeaderboardTexture(); // Create texture once

  const boxGeo = new BoxGeometry(1, 1, 1);
  boxGeo.translate(0, 0.5, 0); // pivot at bottom

  const edgesGeo = new EdgesGeometry(boxGeo);

  // Reusable Materials
  const buildingMaterials = windowTextures.map(
    (t) =>
      new MeshLambertMaterial({
        color: 0x222222,
        map: t,
      }),
  );

  const edgeMat1 = new LineBasicMaterial({
    color: 0xff00cc,
    transparent: true,
    opacity: 0.4,
  });
  const edgeMat2 = new LineBasicMaterial({
    color: 0x00ccff,
    transparent: true,
    opacity: 0.4,
  });
  const topEdgeMat = new LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
  });
  const antennaMat = new MeshBasicMaterial({ color: 0xffffff });
  const ventMat = new MeshLambertMaterial({ color: 0x333333 });
  const pipeMat = new MeshLambertMaterial({ color: 0x444444 });
  const warningLightMat = new MeshBasicMaterial({ color: 0xff0000 });

  const billboardMaterials = billboardTextures.map(
    (tex) =>
      new MeshBasicMaterial({
        map: tex,
        side: DoubleSide,
        transparent: true,
        opacity: 0.9,
      }),
  );

  // Helper to add rooftop details
  const addRooftopDetails = (
    group: Group,
    w: number,
    y: number,
    d: number,
    offX = 0,
    offZ = 0,
  ) => {
    // Antenna
    if (Math.random() > 0.6) {
      const antH = 10 + Math.random() * 30;
      const ant = new Mesh(boxGeo, antennaMat); // using box as stick
      ant.scale.set(0.5, antH, 0.5);
      ant.position.set(offX, y, offZ);
      group.add(ant);

      // Warning Light
      if (y + antH > 150) {
        const light = new Mesh(boxGeo, warningLightMat);
        light.scale.set(1, 1, 1);
        light.position.set(offX, y + antH, offZ);
        group.add(light);
      }
    }

    // Vents / AC Units
    if (w > 10 && d > 10) {
      const numVents = Math.floor(Math.random() * 4);
      for (let i = 0; i < numVents; i++) {
        const vent = new Mesh(boxGeo, ventMat);
        const vW = 3 + Math.random() * 4;
        const vH = 2 + Math.random() * 3;
        const vD = 3 + Math.random() * 4;
        vent.scale.set(vW, vH, vD);

        const vX = (Math.random() - 0.5) * (w - vW) + offX;
        const vZ = (Math.random() - 0.5) * (d - vD) + offZ;

        vent.position.set(vX, y, vZ);
        group.add(vent);
      }
    }
  };

  // Helper to create building based on style
  const createBuilding = (
    x: number,
    z: number,
    w: number,
    h: number,
    d: number,
    isLeaderboard: boolean,
  ) => {
    const group = new Group();
    group.position.set(x, 0, z);

    // Select Material
    const matIndex = Math.floor(Math.random() * buildingMaterials.length);
    const mat = buildingMaterials[matIndex];
    const edgeMat = Math.random() > 0.5 ? edgeMat1 : edgeMat2;

    // Style determination
    // 0: Standard, 1: Stepped, 2: Twin Towers
    let style = 0;
    if (!isLeaderboard && h > 80 && w > 20 && d > 20) {
      const r = Math.random();
      if (r < 0.3) style = 1;
      else if (r < 0.5) style = 2;
    }

    if (isLeaderboard) style = 0; // Keep leaderboard simple base

    // Helper to create geometry with tiled UVs
    const createTiledBox = (bw: number, bh: number, bd: number) => {
      // Create a unique geometry for this block to support custom UVs
      const geo = new BoxGeometry(bw, bh, bd);

      // Scale factor for UVs to ensure texture density is consistent
      const scaleU = 0.05;
      const scaleV = 0.05;

      const uvAttribute = geo.attributes.uv;

      // Three.js BoxGeometry constructs faces in a specific order:
      // +x (Right), -x (Left), +y (Top), -y (Bottom), +z (Front), -z (Back)
      // Each face has 4 vertices (indexed geometry).
      // We identify the face by index range (0-3, 4-7, etc.) and scale UVs based on that face's dimensions.

      for (let i = 0; i < uvAttribute.count; i++) {
        const u = uvAttribute.getX(i);
        const v = uvAttribute.getY(i);

        let sU = 1;
        let sV = 1;

        // Face determination
        const faceIndex = Math.floor(i / 4);

        if (faceIndex === 0 || faceIndex === 1) { // Right / Left
            sU = bd * scaleU;
            sV = bh * scaleV;
        } else if (faceIndex === 2 || faceIndex === 3) { // Top / Bottom
            sU = bw * scaleU;
            sV = bd * scaleV;
        } else { // Front / Back
            sU = bw * scaleU;
            sV = bh * scaleV;
        }

        uvAttribute.setXY(i, u * sU, v * sV);
      }

      // Adjust pivot to bottom like before?
      // Old: boxGeo.translate(0, 0.5, 0) then scale.
      // New: geo is size w, h, d. Center is 0,0,0.
      // We want bottom at 0. So translate y by h/2.
      geo.translate(0, bh / 2, 0);

      return new Mesh(geo, mat);
    };

    if (style === 1) {
      // Stepped (Ziggurat)
      const tiers = 3;
      let currentH = 0;
      let currentW = w;
      let currentD = d;

      for (let i = 0; i < tiers; i++) {
        const tierH = h / tiers;

        // Use createTiledBox instead of scaling a unit box
        const mesh = createTiledBox(currentW, tierH, currentD);
        mesh.position.y = currentH;
        group.add(mesh);

        const edges = new LineSegments(edgesGeo, edgeMat);
        edges.scale.set(currentW, tierH, currentD);
        // The edge geometry is pivoted at bottom (0.5 y).
        // Our new mesh is also pivoted at bottom locally (via translate).
        // Wait, mesh.position.y = currentH puts the bottom at currentH.
        // The edge geometry `boxGeo` was `translate(0, 0.5, 0)`.
        // `edgesGeo` was created from that.
        // So `edges` with scale (w, h, d) will sit on XZ plane if position is 0.
        // So `edges.position.y = currentH` is correct.
        edges.position.y = currentH;
        group.add(edges);

        currentH += tierH;
        currentW *= 0.7;
        currentD *= 0.7;
      }
      // Add details on top
      addRooftopDetails(group, currentW, currentH, currentD);
    } else if (style === 2) {
      // Twin Towers
      // Base
      const baseH = h * 0.2;
      const base = createTiledBox(w, baseH, d);
      group.add(base);

      const baseEdges = new LineSegments(edgesGeo, edgeMat);
      baseEdges.scale.set(w, baseH, d);
      group.add(baseEdges);

      // Towers
      const towerW = w * 0.35;
      const towerD = d * 0.35;
      const towerH = h - baseH;

      // Tower 1
      const t1 = createTiledBox(towerW, towerH, towerD);
      t1.position.set(-w * 0.25, baseH, -d * 0.25);
      group.add(t1);

      const t1e = new LineSegments(edgesGeo, edgeMat);
      t1e.scale.set(towerW, towerH, towerD);
      t1e.position.set(-w * 0.25, baseH, -d * 0.25);
      group.add(t1e);

      // Tower 2
      const t2 = createTiledBox(towerW, towerH, towerD);
      t2.position.set(w * 0.25, baseH, d * 0.25);
      group.add(t2);

      const t2e = new LineSegments(edgesGeo, edgeMat);
      t2e.scale.set(towerW, towerH, towerD);
      t2e.position.set(w * 0.25, baseH, d * 0.25);
      group.add(t2e);

      addRooftopDetails(group, towerW, h, towerD, -w * 0.25, -d * 0.25);
      addRooftopDetails(group, towerW, h, towerD, w * 0.25, d * 0.25);
    } else {
      // Standard (Original + enhancements)
      const mainBlock = createTiledBox(w, h, d);
      group.add(mainBlock);

      const line = new LineSegments(edgesGeo, edgeMat);
      line.scale.set(w, h, d);
      group.add(line);

      // Random setbacks/top structure
      if (h > 100 && Math.random() > 0.4) {
        const h2 = h * 0.3;
        const w2 = w * 0.6;
        const d2 = d * 0.6;

        const topBlock = createTiledBox(w2, h2, d2);
        topBlock.position.y = h;
        group.add(topBlock);

        const topEdge = new LineSegments(edgesGeo, topEdgeMat);
        topEdge.scale.set(w2, h2, d2);
        topEdge.position.y = h;
        group.add(topEdge);

        addRooftopDetails(group, w2, h + h2, d2);
      } else {
        addRooftopDetails(group, w, h, d);
      }
    }

    // Billboards
    if (!isLeaderboard && h > 60 && Math.random() > 0.7) {
      const texIndex = Math.floor(Math.random() * billboardMaterials.length);
      const bbMat = billboardMaterials[texIndex];

      const bbW = 20 + Math.random() * 15;
      const bbH = 10 + Math.random() * 10;
      const bbGeo = new PlaneGeometry(bbW, bbH);
      const billboard = new Mesh(bbGeo, bbMat);

      // Position on a random face
      const face = Math.floor(Math.random() * 4);
      const offset = 1;

      // Ensure we attach to the main mass of the building
      // If stepped, we should attach to bottom or mid tier.
      // For simplicity, attach to center of "w,h,d" box space, but need to be careful with stepped.
      // If stepped, h is total h.

      let attachH = h * (0.5 + Math.random() * 0.3);
      if (style === 1) attachH = h * 0.4; // lower for stepped

      if (face === 0) {
        billboard.position.set(0, attachH, d / 2 + offset);
      } else if (face === 1) {
        billboard.position.set(0, attachH, -d / 2 - offset);
        billboard.rotation.y = Math.PI;
      } else if (face === 2) {
        billboard.position.set(w / 2 + offset, attachH, 0);
        billboard.rotation.y = Math.PI / 2;
      } else {
        billboard.position.set(-w / 2 - offset, attachH, 0);
        billboard.rotation.y = -Math.PI / 2;
      }
      group.add(billboard);
    }

    // Side Pipes (Industrial detail)
    if (!isLeaderboard && h > 100 && Math.random() > 0.6) {
        const pipeH = h * 0.8;
        const pipeR = 1 + Math.random() * 2;
        const pipe = new Mesh(new CylinderGeometry(pipeR, pipeR, pipeH), pipeMat);

        // Attach to side
        const side = Math.floor(Math.random() * 4);
        if (side === 0) pipe.position.set(w/3, pipeH/2, d/2 + pipeR);
        else if (side === 1) pipe.position.set(-w/3, pipeH/2, -d/2 - pipeR);
        else if (side === 2) pipe.position.set(w/2 + pipeR, pipeH/2, d/3);
        else pipe.position.set(-w/2 - pipeR, pipeH/2, -d/3);

        group.add(pipe);
    }

    return group;
  };

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      const isLeaderboardBuilding = x === 5 && z === 5;

      // Skip some blocks for variety, but never skip the leaderboard building
      if (!isLeaderboardBuilding && Math.random() > 0.8) continue;

      const xPos = START_OFFSET + x * CELL_SIZE;
      const zPos = START_OFFSET + z * CELL_SIZE;

      let h = 40 + Math.random() * 120; // Slightly taller minimum
      let w = BLOCK_SIZE - 10 - Math.random() * 20;
      let d = BLOCK_SIZE - 10 - Math.random() * 20;

      if (isLeaderboardBuilding) {
        h = 250; // Very tall
        w = BLOCK_SIZE - 10;
        d = BLOCK_SIZE - 10;
      }

      occupiedGrids.set(`${x},${z}`, { halfW: w / 2, halfD: d / 2 });

      const buildingGroup = createBuilding(xPos, zPos, w, h, d, isLeaderboardBuilding);

      // Leaderboard specifics (Textures)
      if (isLeaderboardBuilding) {
        const lbW = w * 0.8;
        const lbH = lbW * 1.0;
        const lbGeo = new PlaneGeometry(lbW, lbH);

        for (let i = 0; i < 4; i++) {
          const lbMat = new MeshBasicMaterial({
            map: lbTexture,
            side: DoubleSide,
            color: 0xffffff,
          });

          const lbMesh = new Mesh(lbGeo, lbMat);
          const offset = 0.6;
          const yPos = h * 0.7;

          if (i === 0) {
            lbMesh.position.set(0, yPos, d / 2 + offset);
            lbMesh.rotation.y = 0;
          } else if (i === 1) {
            lbMesh.position.set(0, yPos, -d / 2 - offset);
            lbMesh.rotation.y = Math.PI;
          } else if (i === 2) {
            lbMesh.position.set(w / 2 + offset, yPos, 0);
            lbMesh.rotation.y = Math.PI / 2;
          } else {
            lbMesh.position.set(-w / 2 - offset, yPos, 0);
            lbMesh.rotation.y = -Math.PI / 2;
          }

          buildingGroup.add(lbMesh);

          const spot = new SpotLight(0x00ffcc, 500, 100, 0.6, 0.5, 1);

          if (i === 0) spot.position.set(0, h * 0.9, d + 30);
          else if (i === 1) spot.position.set(0, h * 0.9, -d - 30);
          else if (i === 2) spot.position.set(w + 30, h * 0.9, 0);
          else spot.position.set(-w - 30, h * 0.9, 0);

          spot.target = lbMesh;
          buildingGroup.add(spot);
          buildingGroup.add(spot.target);
        }
      }

      scene.add(buildingGroup);
      buildings.push(buildingGroup);
    }
  }

  // Cars
  const carGeo = new BoxGeometry(4, 2, 8);
  const tailLightGeo = new BoxGeometry(0.5, 0.5, 0.1);
  const headLightGeo = new BoxGeometry(0.5, 0.5, 0.1);

  // Reusable Car Materials
  const carBodyMat1 = new MeshLambertMaterial({ color: 0x222222 });
  const carBodyMat2 = new MeshLambertMaterial({ color: 0x050505 });
  const carBodyMat3 = new MeshLambertMaterial({ color: 0x111111 });

  const underglowGeo = new PlaneGeometry(5, 9);
  const underglowMat1 = new MeshBasicMaterial({
    color: 0xff00cc,
    opacity: 0.5,
    transparent: true,
    side: DoubleSide,
  });
  const underglowMat2 = new MeshBasicMaterial({
    color: 0x00ccff,
    opacity: 0.5,
    transparent: true,
    side: DoubleSide,
  });

  const tailLightMat = new MeshBasicMaterial({ color: 0xff0000 });
  const headLightMat = new MeshBasicMaterial({ color: 0xffffaa });

  // Hitbox for easier selection
  const hitboxGeo = new BoxGeometry(20, 20, 30);
  const hitboxMat = new MeshBasicMaterial({
    color: 0xff0000, // Color doesn't matter (invisible)
    transparent: true,
    opacity: 0,
    depthWrite: false,
    visible: true,
  });

  for (let i = 0; i < CAR_COUNT; i++) {
    const isSpecial = Math.random() > 0.8;
    const bodyMat = (
      isSpecial ? carBodyMat1 : Math.random() > 0.5 ? carBodyMat2 : carBodyMat3
    ).clone();
    bodyMat.transparent = true;

    // Car Group
    const carGroup = new Group();

    // Car Body
    const carBody = new Mesh(carGeo, bodyMat);
    carBody.userData.originalOpacity = 1.0;
    carGroup.add(carBody);

    // Underglow (Neon)
    if (Math.random() > 0.3) {
      const underglowMat = (
        Math.random() > 0.5 ? underglowMat1 : underglowMat2
      ).clone();
      const underglow = new Mesh(underglowGeo, underglowMat);
      underglow.userData.originalOpacity = 0.5;
      underglow.rotation.x = Math.PI / 2;
      underglow.position.y = -0.9;
      carGroup.add(underglow);
    }

    // Tail lights
    const tlMat = tailLightMat.clone();
    tlMat.transparent = true;
    const tl1 = new Mesh(tailLightGeo, tlMat);
    tl1.userData.originalOpacity = 1.0;
    tl1.position.set(1.5, 0, -4);
    carGroup.add(tl1);

    const tl2 = new Mesh(tailLightGeo, tlMat);
    tl2.userData.originalOpacity = 1.0;
    tl2.position.set(-1.5, 0, -4);
    carGroup.add(tl2);

    // Head lights
    const hlMat = headLightMat.clone();
    hlMat.transparent = true;
    const hl1 = new Mesh(headLightGeo, hlMat);
    hl1.userData.originalOpacity = 1.0;
    hl1.position.set(1.5, 0, 4);
    carGroup.add(hl1);

    const hl2 = new Mesh(headLightGeo, hlMat);
    hl2.userData.originalOpacity = 1.0;
    hl2.position.set(-1.5, 0, 4);
    carGroup.add(hl2);

    // Invisible Hitbox
    const hitbox = new Mesh(hitboxGeo, hitboxMat);
    hitbox.userData.originalOpacity = 0;
    carGroup.add(hitbox);

    // Use resetCar to set initial position and state
    carGroup.userData = {}; // init object
    resetCar(carGroup);

    scene.add(carGroup);
    cars.push(carGroup);
  }

  // Drone Swarm (formerly Starfield)
  const droneGeo = new BufferGeometry();
  const droneCount = DRONE_COUNT;
  const dronePositions = new Float32Array(droneCount * 3);
  const droneColorsArray = new Float32Array(droneCount * 3);
  droneTargetPositions = new Float32Array(droneCount * 3);
  droneBasePositions = new Float32Array(droneCount * 3);

  // Initialize Base Positions
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

  // Initial generation
  generateDroneTargets(route.path);

  // Set initial positions to target positions
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
    size: 15, // Larger to see the texture
    map: createDroneTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false, // Better for transparency
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
  sparks.frustumCulled = false; // Prevent culling when sparks fly outside initial bounds
  scene.add(sparks);

  // Initialize Fireworks via Manager
  konamiManager = new KonamiManager(scene);

  createCheckpoint();
  createNavArrow();
  createChaseArrow();

  window.addEventListener("resize", onResize);
  window.addEventListener("click", onClick);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("mousemove", onMouseMove);
  // Pointer lock change
  document.addEventListener("pointerlockchange", onPointerLockChange);

  // Initialize Game Context and Manager
  const context: GameContext = {
    scene,
    camera,
    renderer,
    cars,
    drones,
    occupiedGrids,
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

  // Load initial leaderboard
  ScoreService.getTopScores().then((scores) => {
    leaderboard.value = scores;
    updateLeaderboardTexture(); // Ensure texture updates with loaded scores
  });
});

function onKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    exitGameMode();
    return;
  }

  // Konami Code Check
  konamiManager.onKeyDown(event);

  gameModeManager.onKeyDown(event);
}

function onKeyUp(event: KeyboardEvent) {
  gameModeManager.onKeyUp(event);
}

// Seeded random number generator
function mulberry32(a: number) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate targets based on route
function generateDroneTargets(path: string) {
  // If we are in Drone Mode, let it handle it?
  // Actually standard idle behavior uses this.
  
  // Create a seed from the path string
  let seed = 0;
  for (let i = 0; i < path.length; i++) {
    seed = (seed << 5) - seed + path.charCodeAt(i);
    seed |= 0;
  }
  // Ensure positive seed
  seed = Math.abs(seed) + 1;

  const rand = mulberry32(seed);

  for (let i = 0; i < droneTargetPositions.length / 3; i++) {
    // Generate a small offset instead of a new full position
    const xOffset = (rand() - 0.5) * 500;
    const yOffset = (rand() - 0.5) * 200;
    const zOffset = (rand() - 0.5) * 500;

    if (droneBasePositions) {
      droneTargetPositions[i * 3] = droneBasePositions[i * 3] + xOffset;
      droneTargetPositions[i * 3 + 1] = droneBasePositions[i * 3 + 1] + yOffset;
      droneTargetPositions[i * 3 + 2] = droneBasePositions[i * 3 + 2] + zOffset;
    } else {
      // Fallback
      droneTargetPositions[i * 3] = xOffset * 8;
      droneTargetPositions[i * 3 + 1] = 300 + (yOffset + 100) * 4;
      droneTargetPositions[i * 3 + 2] = zOffset * 8;
    }
  }
}

watch(
  () => route.path,
  (newPath) => {
    // Only update targets if NOT in a specific game mode that overrides drone behavior
    if (!isGameMode.value && !isDrivingMode.value) {
      generateDroneTargets(newPath);
    }
  },
);

watch(activeCar, (newCar, oldCar) => {
  if (oldCar) removeLightsFromCar(oldCar);
  if (newCar) addLightsToCar(newCar);
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
    if (activeCar.value) {
       // Cleanup handled by DrivingMode.cleanup() but we also sync state here just in case
       // or rather, rely on manager.
       // The cleanup() of DrivingMode nulls activeCar but maybe we should ensure it.
    }
  }

  if (isExplorationMode.value) {
    isExplorationMode.value = false;
  }

  if (isFlyingTour.value) {
    isFlyingTour.value = false;
  }

  isGameMode.value = false;
  isGameOver.value = false;
  score.value = 0;
  droneScore.value = 0;
  drivingScore.value = 0;
  emit("game-end");

  // Restore dead drones & Reset positions to targets
  // This logic was partly in DroneMode.cleanup but we want it for ALL modes exit probably?
  // Actually only DroneMode messed with drones significantly (killed them).
  // But DroneMode.cleanup() clears deadDrones set.
  // We need to ensure positions are reset to target positions so they don't get stuck.
  
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
  updateIsMobile();
}

function onPointerLockChange() {
  // If pointer lock is lost and we are in desktop exploration mode, maybe pause?
  // Or just let it be.
}

function onClick(event: MouseEvent) {
  if (!camera) return;

  // Delegate to active mode
  gameModeManager.onClick(event);

  // If we are already in a mode that consumes clicks (like Exploration requestPointerLock inside mode), we might stop.
  // But DroneMode also uses clicks.
  // We need to check if we are in a mode.
  if (isGameMode.value || isDrivingMode.value) return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  // Cars Interaction (Start Driving) is "Lobby" logic
  // Traverse cars to get meshes
  const carMeshes: Object3D[] = [];
  cars.forEach((c) =>
    c.traverse((child) => {
      if (child instanceof Mesh) carMeshes.push(child);
    }),
  );

  const carIntersects = raycaster.intersectObjects(carMeshes);
  if (carIntersects.length > 0) {
    const hit = carIntersects[0].object;
    // Traverse up to find Group
    let target = hit;
    while (target.parent && target.parent.type !== "Scene") {
      target = target.parent;
    }

    if (target instanceof Group && target.userData.speed !== undefined) {
      // Found a car
      isDrivingMode.value = true;
      emit("game-start");
      
      activeCar.value = target;
      target.userData.isPlayerControlled = true;
      target.userData.currentSpeed = target.userData.speed;
      
      gameModeManager.setMode(new DrivingMode());
      return;
    }
  }
  
  // Drone Interaction (Lobby Shooting)
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

        // Hide drone
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

  // Let GameModeManager handle active mode logic
  gameModeManager.update(dt, time);

  // Global Logic (e.g. World Simulation) logic that runs regardless of mode (or if not handled by mode)
  
  // Move cars & Handle Collisions
  // Note: DrivingMode handles the PLAYER car. We should skip it here if it's Player Controlled.
  
  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];

    if (car.userData.isPlayerControlled) {
       // Skip physics update for player car here, let DrivingMode handle it
       // But we still need checking for collision with OTHER cars?
       // DrivingMode checks collision with environment.
       // We might need to handle car-car collision here or in DrivingMode.
       // Current implementation of checks is below (N^2 check).
       continue;
    }

    if (!car.userData.fading) {
      // AI Movement
      if (!car.userData.isPlayerHit) {
        if (car.userData.axis === "x") {
          car.position.x += car.userData.speed * car.userData.dir;
          if (car.position.x > BOUNDS) car.position.x = -BOUNDS;
          if (car.position.x < -BOUNDS) car.position.x = BOUNDS;
        } else {
          car.position.z += car.userData.speed * car.userData.dir;
          if (car.position.z > BOUNDS) car.position.z = -BOUNDS;
          if (car.position.z < -BOUNDS) car.position.z = BOUNDS;
        }
      }
    } else {
      // Fading out logic
      if (car.userData.axis === "x") {
        car.position.x += car.userData.speed * 0.5 * car.userData.dir;
      } else {
        car.position.z += car.userData.speed * 0.5 * car.userData.dir;
      }

      car.userData.opacity -= 0.02;
      if (car.userData.opacity <= 0) {
        resetCar(car);
      } else {
        // Apply opacity
        car.traverse((child) => {
          if (child instanceof Mesh) {
            const mat = child.material;
            if (!Array.isArray(mat)) {
              const original =
                child.userData.originalOpacity !== undefined
                  ? child.userData.originalOpacity
                  : 1.0;
              mat.opacity = original * car.userData.opacity;
            }
          }
        });
      }
    }
  }

  // Check Collisions
  const actualCollisionDist = 6;

  for (let i = 0; i < cars.length; i++) {
    const carA = cars[i];
    if (carA.userData.fading) continue;

    for (let j = i + 1; j < cars.length; j++) {
      const carB = cars[j];
      if (carB.userData.fading) continue;

      const dx = carA.position.x - carB.position.x;
      const dz = carA.position.z - carB.position.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < actualCollisionDist * actualCollisionDist) {
        // If player is involved
        if (
          carA.userData.isPlayerControlled ||
          carB.userData.isPlayerControlled
        ) {
          // Bounce player, destroy AI?
          const player = carA.userData.isPlayerControlled ? carA : carB;
          const ai = carA.userData.isPlayerControlled ? carB : carA;

          player.userData.currentSpeed *= -0.5;
          carAudio.playCrash();
          // Push apart
          player.position.x += (player.position.x - ai.position.x) * 0.5;
          player.position.z += (player.position.z - ai.position.z) * 0.5;

          ai.userData.fading = true; // Destroy AI car
          ai.userData.dir *= -1;
          ai.rotation.y += Math.random() - 0.5;
          spawnSparks(player.position);
          continue;
        }

        // Additional check to reduce collision rate for AI
        if (Math.random() > 0.5) continue;

        // Collision!
        carA.userData.fading = true;
        carB.userData.fading = true;

        carA.userData.dir *= -1;
        carB.userData.dir *= -1;

        carA.rotation.y += Math.random() - 0.5;
        carB.rotation.y += Math.random() - 0.5;
      }
    }
  }

  // Update Sparks
  if (sparks) {
    const positions = sparks.geometry.attributes.position.array;
    let needsUpdate = false;

    for (let i = 0; i < sparkCount; i++) {
      if (sparkLifetimes[i] > 0) {
        sparkVelocities[i * 3 + 1] -= 0.1; // gravity
        positions[i * 3] += sparkVelocities[i * 3];
        positions[i * 3 + 1] += sparkVelocities[i * 3 + 1];
        positions[i * 3 + 2] += sparkVelocities[i * 3 + 2];

        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 0;
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

  // Move drones (Default Behavior if NOT handled by DroneMode)
  // DroneMode automatically updates them in its update() method.
  // We check if we are in DroneMode. If so, skip.
  const isDroneMode = gameModeManager.getMode() instanceof DroneMode;
  
  if (drones && !isDroneMode) {
    const positions = drones.geometry.attributes.position.array;
    
    // Standard Mode: Oscillation around target
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

  // Camera movement (Orbit if no mode logic)
  // If GameMode is active, it handles camera.
  // Exception: DrivingMode handles camera. ExplorationMode handles camera. FlyingTourMode handles camera.
  // If we receive "Standard Orbit" logic inside the mode? No.
  // If gameModeManager.getMode() is null, or update() doesn't set camera, we do orbit.
  
  if (!gameModeManager.getMode()) {
    // Standard Orbit
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
  
  renderer.render(scene, camera);
}

let audioCtx: AudioContext | null = null;

function playPewSound() {
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
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
  oscillator.frequency.exponentialRampToValueAtTime(
    110,
    audioCtx.currentTime + 0.2,
  ); // Drop to A2

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.2);
}

onBeforeUnmount(() => {
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

#score-counter {
  position: fixed;
  bottom: 20px;
  right: 20px;
  color: #00ffcc;
  font-family: "Courier New", Courier, monospace;
  font-size: 24px;
  font-weight: bold;
  z-index: 10;
  text-shadow: 0 0 10px #00ffcc;
  pointer-events: none;
}

#timer-counter {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #ff00cc;
  font-family: "Courier New", Courier, monospace;
  font-size: 32px;
  font-weight: bold;
  z-index: 10;
  text-shadow: 0 0 10px #ff00cc;
  pointer-events: none;
}

#dist-counter {
  position: fixed;
  top: 60px; /* Below timer */
  left: 50%;
  transform: translateX(-50%);
  color: #ffff00;
  font-family: "Courier New", Courier, monospace;
  font-size: 24px;
  font-weight: bold;
  z-index: 10;
  text-shadow: 0 0 10px #ffff00;
  pointer-events: none;
}

#game-over {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff0000;
  font-family: "Courier New", Courier, monospace;
  font-size: 64px;
  font-weight: bold;
  z-index: 30;
  text-shadow: 0 0 20px #ff0000;
  text-shadow: 0 0 20px #ff0000;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.9);
  padding: 40px;
  border: 4px solid #ff0000;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 400px;
}

#return-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: #ff00cc;
  border: 1px solid #ff00cc;
  padding: 10px 20px;
  font-family: "Courier New", Courier, monospace;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  text-shadow: 0 0 5px #ff00cc;
  box-shadow: 0 0 10px #ff00cc;
}

#return-button:hover {
  background: rgba(255, 0, 204, 0.2);
  color: #ffffff;
  text-shadow: 0 0 10px #ffffff;
}

#driving-controls,
#exploration-controls {
  position: fixed;
  bottom: 80px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  z-index: 20;
  pointer-events: none; /* Allow clicks to pass through empty space */
}

.control-group {
  display: flex;
  gap: 20px;
  pointer-events: auto;
}

.control-btn {
  width: 60px;
  height: 60px;
  background: rgba(0, 255, 204, 0.2);
  border: 2px solid #00ffcc;
  border-radius: 50%;
  color: #00ffcc;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
}

.control-btn:active {
  background: rgba(0, 255, 204, 0.5);
  color: #fff;
}

.dpad {
  position: relative;
  width: 100px;
  height: 100px;
}

.dpad-btn {
  position: absolute;
  width: 30px;
  height: 30px;
  background: rgba(0, 255, 204, 0.2);
  border: 1px solid #00ffcc;
  color: #00ffcc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
}
.dpad-btn:active {
  background: rgba(0, 255, 204, 0.5);
  color: #fff;
}

.dpad-btn.up {
  top: 0;
  left: 35px;
}
.dpad-btn.down {
  bottom: 0;
  left: 35px;
}
.dpad-btn.left {
  top: 35px;
  left: 0;
}
.dpad-btn.right {
  top: 35px;
  right: 0;
}
.game-over-title {
  font-size: 64px;
  color: #ff0000;
  margin-bottom: 20px;
}
.final-score {
  font-size: 32px;
  color: #ffff00;
  margin-bottom: 30px;
}
.score-form {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  z-index: 100;
}
.name-input {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #00ffcc;
  color: #00ffcc;
  padding: 10px;
  font-family: inherit;
  font-size: 24px;
  text-transform: uppercase;
  width: 200px;
  pointer-events: auto;
}
.submit-btn {
  background: #00ffcc;
  color: #000;
  border: none;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  pointer-events: auto;
}
.submit-btn:hover {
  background: #fff;
}
.leaderboard {
  width: 100%;
  max-width: 400px;
  text-align: left;
}
.lb-header {
  color: #ff00cc;
  font-size: 24px;
  border-bottom: 2px solid #ff00cc;
  margin-bottom: 10px;
  padding-bottom: 5px;
}
.lb-row {
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  color: #fff;
  margin-bottom: 5px;
  text-transform: uppercase;
}
</style>
