
(function() {
    const THREE = window.THREE;
    let updateStateCallback = null;




import {
  THREE.AdditiveBlending,
  THREE.AmbientLight,
  THREE.BoxGeometry,
  THREE.BufferAttribute,
  THREE.BufferGeometry,
  THREE.CanvasTexture,
  THREE.Color,
  THREE.DirectionalLight,
  THREE.DoubleSide,
  THREE.EdgesGeometry,
  THREE.FogExp2,
  THREE.Group,
  THREE.InterleavedBufferAttribute,
  THREE.Line,
  THREE.LineBasicMaterial,
  THREE.LineSegments,
  THREE.Mesh,
  THREE.MeshBasicMaterial,
  THREE.MeshLambertMaterial,
  THREE.MeshStandardMaterial,
  THREE.NearestFilter,
  THREE.Object3D,
  THREE.PerspectiveCamera,
  THREE.PlaneGeometry,
  THREE.Points,
  THREE.PointsMaterial,
  THREE.Raycaster,
  THREE.RepeatWrapping,
  THREE.Scene,
  THREE.SpotLight,
  THREE.Vector2,
  THREE.Vector3,
  THREE.WebGLRenderer,
  THREE.Euler,
  THREE.Quaternion,
  THREE.CylinderGeometry,
  THREE.ConeGeometry,
} from "three";

let canvasContainer = null;

let scene;
let camera;
let renderer;
let animationId;
let isActive = false;

const buildings = [];
const occupiedGrids = new Map<string, { halfW; halfD }>();
const cars = [];

let drones;
let droneTargetPositions;
let droneBasePositions;
const deadDrones = new Set();
let score = 0;
let isGameMode = false;
let isDrivingMode = false;
let isExplorationMode = false;
let isFlyingTour = false;
let isTransitioning = false;
let activeCar = null;
let checkpointMesh;
let navArrow;
let timeLeft = 0;
let lastTime = 0;
let distToTarget = 0;

let isMobile = false;

const updateIsMobile = () => {
  isMobile = window.innerWidth <= 768;
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

let isJumping = false;
let velocityY = 0;
const gravity = 0.015;
const jumpStrength = 0.4;
const groundPosition = 1.8;

const playerRotation = new THREE.Euler(0, 0, 0, "YXZ");

// Car Audio System
class CarAudio {
  ctx | null = null;
  engineOsc | null = null;
  engineGain | null = null;
  lfo | null = null;
  lfoGain | null = null;
  isPlaying = false;

  init() {
    const AudioContext =
      window.AudioContext || (window).webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
  }

  start() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();
    if (this.isPlaying) return;

    // Engine rumble (Sawtooth with LFO for "purr")
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = "sawtooth";
    this.engineOsc.frequency = 60; // Idle RPM

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain = 0.1;

    // LFO for modulation (the "chug-chug")
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = "sine";
    this.lfo.frequency = 10;

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain = 20; // Modulation depth

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.engineOsc.frequency);

    // Filter to dampen the harsh sawtooth
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency = 400;

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    this.engineOsc.start();
    this.lfo.start();
    this.isPlaying = true;
  }

  update(speed) {
    if (!this.ctx || !this.engineOsc || !this.lfo || !this.engineGain) return;

    // Pitch mapping
    // Speed 0 -> 60Hz
    // Speed 4 -> ~200Hz
    const absSpeed = Math.abs(speed);
    const targetFreq = 60 + absSpeed * 40;
    const targetLfoRate = 10 + absSpeed * 5;

    // Smooth transitions
    const time = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, time, 0.1);
    this.lfo.frequency.setTargetAtTime(targetLfoRate, time, 0.1);

    // Volume (idle is quieter)
    // const targetVol = 0.1 + (absSpeed * 0.05);
    // this.engineGain.gain.setTargetAtTime(targetVol, time, 0.1);
  }

  stop() {
    if (!this.isPlaying) return;
    if (this.engineOsc) this.engineOsc.stop();
    if (this.lfo) this.lfo.stop();
    this.engineOsc = null;
    this.lfo = null;
    this.isPlaying = false;
  }

  playCrash() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Noise buffer would be better, but we use erratic oscillators for "crunch"
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(10, t + 0.3);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }
}

const carAudio = new CarAudio();

const emit = (name, val) => { if(window.onGameEvent) window.onGameEvent(name); };
let droneVelocities;
const currentLookAt = new THREE.Vector3(0, 0, 0);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Sparks system
let sparks;
const sparkCount = 2000;
const sparkPositions = new Float32Array(sparkCount * 3);
const sparkVelocities = new Float32Array(sparkCount * 3);
const sparkLifetimes = new Float32Array(sparkCount); // 0 = dead, 1 = full life

const route = { path: window.location.pathname };

// Configuration
const CITY_SIZE = 2000;
const BLOCK_SIZE = 150;
const ROAD_WIDTH = 40;
const CELL_SIZE = BLOCK_SIZE + ROAD_WIDTH;

const GRID_SIZE = Math.floor(CITY_SIZE / CELL_SIZE);
// We will generate a grid of buildings.
// Grid range: -GRID_SIZE/2 to GRID_SIZE/2
const startOffset = -(GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2;
const BOUNDS = (GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE;

const CAR_COUNT = 150;

// Function to reset/spawn a car
function addLightsToCar(car) {
  // Headlights
  const hlColor = 0xffffaa;
  const hlIntensity = 2000;
  const hlDist = 800;
  const hlAngle = Math.PI / 4.5; // Narrower angle to prevent reaching too high
  const hlPenumbra = 0.2;

  const hl1 = new THREE.SpotLight(
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
  const hl1Target = new THREE.Object3D();
  hl1Target.position.set(1.5, -10, 40);
  car.add(hl1Target);
  hl1.target = hl1Target;

  hl1.userData.isCarLight = true;
  car.add(hl1);

  const hl2 = new THREE.SpotLight(
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
  const hl2Target = new THREE.Object3D();
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

  const tl1 = new THREE.SpotLight(tlColor, tlIntensity, tlDist, tlAngle, 0.5, 1);
  tl1.position.set(1.5, 2, -4);

  const tl1Target = new THREE.Object3D();
  tl1Target.position.set(1.5, -5, -20);
  car.add(tl1Target);
  tl1.target = tl1Target;

  tl1.userData.isCarLight = true;
  car.add(tl1);

  const tl2 = new THREE.SpotLight(tlColor, tlIntensity, tlDist, tlAngle, 0.5, 1);
  tl2.position.set(-1.5, 2, -4);

  const tl2Target = new THREE.Object3D();
  tl2Target.position.set(-1.5, -5, -20);
  car.add(tl2Target);
  tl2.target = tl2Target;

  tl2.userData.isCarLight = true;
  car.add(tl2);
}

function removeLightsFromCar(car) {
  const lightsToRemove = [];
  const targetsToRemove = [];

  car.traverse((child) => {
    if (child.userData.isCarLight) {
      lightsToRemove.push(child);
      if (child instanceof THREE.SpotLight) {
        targetsToRemove.push(child.target);
      }
    }
  });

  lightsToRemove.forEach((l) => {
    car.remove(l);
    if (l instanceof THREE.SpotLight) {
      l.dispose();
    }
  });

  targetsToRemove.forEach((t) => car.remove(t));
}

function resetCar(carGroup) {
  const wasActive = activeCar && carGroup.uuid === activeCar.uuid;

  // Ensure lights are removed if recycled
  removeLightsFromCar(carGroup);

  const axis = Math.random() > 0.5 ? "x" : "z";
  const dir = Math.random() > 0.5 ? 1 : -1;

  const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
  const roadCoordinate = startOffset + roadIndex * CELL_SIZE - CELL_SIZE / 2;

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
    carGroup.rotation.y = dir === 1 ? 0 .PI;
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
    if (child instanceof THREE.Mesh) {
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

// Reusable Texture for Windows
function createWindowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#020202";
    ctx.fillRect(0, 0, 32, 64);
    // random windows
    for (let y = 2; y < 64; y += 4) {
      for (let x = 2; x < 32; x += 4) {
        if (Math.random() > 0.6) {
          ctx.fillStyle = Math.random() > 0.5 ? "#ff00cc" : "#00ccff";
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  return texture;
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
    // Center. Edges.

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

    // Horizontal THREE.Line
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.lineTo(512, 256);
    ctx.stroke();

    // Vertical THREE.Line
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
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.anisotropy = 16;
  return texture;
}

// Generate Billboard Textures
function createBillboardTextures() {
  const textures = [];
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
    const texture = new THREE.CanvasTexture(canvas);
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
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createCheckpoint() {
  // A glowing neon pillar/ring
  const geo = new THREE.CylinderGeometry(25, 25, 1000, 32, 1, true); // Taller and wider
  const mat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.6, // More opaque
    side,
    depthWrite: false,
    blending,
  });
  checkpointMesh = new THREE.Mesh(geo, mat);
  checkpointMesh.visible = false;
  scene.add(checkpointMesh);

  // Inner brighter core
  const coreGeo = new THREE.CylinderGeometry(5, 5, 1000, 16);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const core = new THREE.Mesh(coreGeo, coreMat);
  checkpointMesh.add(core);
}

function createNavArrow() {
  navArrow = new THREE.Group();

  // Cone pointing at target
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(2, 7.5, 16), // Quarter size
    new THREE.MeshBasicMaterial({
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

function spawnCheckpoint() {
  // Pick random road coordinate
  const roadIndexX = Math.floor(Math.random() * (GRID_SIZE + 1));
  const roadIndexZ = Math.floor(Math.random() * (GRID_SIZE + 1));

  // We want the checkpoint to be on an intersection or road
  // Let's pick an intersection for simplicity, or just one axis road

  // Pick random axis
  const axis = Math.random() > 0.5 ? "x" : "z";
  const roadCoordinate =
    startOffset +
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

function spawnSparks(position) {
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
  i,
  position,
  posAttribute | THREE.InterleavedBufferAttribute,
) {
  sparkLifetimes[i] = 1.0;

  // Set position
  posAttribute.setXYZ(i, position.x, position.y, position.z);

  // Random velocity
  sparkVelocities[i * 3] = (Math.random() - 0.5) * 5; // vx
  sparkVelocities[i * 3 + 1] = Math.random() * 5 + 2; // vy (upwards)
  sparkVelocities[i * 3 + 2] = (Math.random() - 0.5) * 5; // vz
}

window.initCyberpunkCity = function(callback, eventCallback) { updateStateCallback = callback; window.onGameEvent = eventCallback; canvasContainer = document.getElementById("cyberpunk-city");
  if (!canvasContainer) return;

  updateIsMobile();

  // THREE.Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050510);
  scene.fog = new THREE.FogExp2(0x050510, 0.001); // Reduced fog density

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    3000,
  );
  camera.position.set(0, 250, 600); // Lowered camera slightly
  camera.lookAt(0, 0, 0);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasContainer.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xff00cc, 0.5);
  dirLight.position.set(100, 200, 100);
  scene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0x00ccff, 0.5);
  dirLight2.position.set(-100, 200, -100);
  scene.add(dirLight2);

  // Ground Plane
  const groundTexture = createGroundTexture();
  const planeGeometry = new THREE.PlaneGeometry(CITY_SIZE * 2, CITY_SIZE * 2);

  // Calculate repetitions based on city size vs cell size
  // CITY_SIZE * 2 covers -2000 to 2000 range approx (4000 total)
  // CELL_SIZE is 190.
  // We want texture to repeat every CELL_SIZE units.
  const repeatCount = (CITY_SIZE * 2) / CELL_SIZE;
  groundTexture.repeat.set(repeatCount, repeatCount);

  // Using THREE.MeshStandardMaterial to allow light casting from car headlights
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff, // White to show texture colors
    map: groundTexture,
    roughness: 0.8,
    metalness: 0.2,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.5;
  scene.add(plane);

  // Generate City Grid
  // const startOffset = -(GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2; // Moved to top
  const windowTexture = createWindowTexture();
  const billboardTextures = createBillboardTextures();

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  boxGeo.translate(0, 0.5, 0); // pivot at bottom

  const edgesGeo = new THREE.EdgesGeometry(boxGeo);

  // Reusable Materials
  const buildingMaterial = new THREE.MeshLambertMaterial({
    color: 0x222222,
    map: windowTexture,
  });

  const edgeMat1 = new THREE.LineBasicMaterial({
    color: 0xff00cc,
    transparent: true,
    opacity: 0.4,
  });
  const edgeMat2 = new THREE.LineBasicMaterial({
    color: 0x00ccff,
    transparent: true,
    opacity: 0.4,
  });
  const topEdgeMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
  });
  const antennaMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const billboardMaterials = billboardTextures.map(
    (tex) =>
      new THREE.MeshBasicMaterial({
        map: tex,
        side,
        transparent: true,
        opacity: 0.9,
      }),
  );

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      // Skip some blocks for variety
      if (Math.random() > 0.8) continue;

      const xPos = startOffset + x * CELL_SIZE;
      const zPos = startOffset + z * CELL_SIZE;

      const h = 40 + Math.random() * 120; // Slightly taller minimum
      const w = BLOCK_SIZE - 10 - Math.random() * 20;
      const d = BLOCK_SIZE - 10 - Math.random() * 20;

      occupiedGrids.set(`${x},${z}`, { halfW: w / 2, halfD: d / 2 });

      const buildingGroup = new THREE.Group();
      buildingGroup.position.set(xPos, 0, zPos);

      // Main Block
      const mainBlock = new THREE.Mesh(boxGeo, buildingMaterial);
      mainBlock.scale.set(w, h, d);
      buildingGroup.add(mainBlock);

      // Edges for Main Block
      const line = new THREE.LineSegments(
        edgesGeo,
        Math.random() > 0.5 ? edgeMat1 : edgeMat2,
      );
      line.scale.set(w, h, d);
      buildingGroup.add(line);

      // Top Structure (for taller buildings)
      if (h > 100 && Math.random() > 0.4) {
        const h2 = h * 0.3;
        const w2 = w * 0.6;
        const d2 = d * 0.6;

        const topBlock = new THREE.Mesh(boxGeo, buildingMaterial);
        topBlock.scale.set(w2, h2, d2);
        topBlock.position.y = h;
        buildingGroup.add(topBlock);

        const topLine = new THREE.LineSegments(edgesGeo, topEdgeMat);
        topLine.scale.set(w2, h2, d2);
        topLine.position.y = h;
        buildingGroup.add(topLine);

        // Antenna
        if (Math.random() > 0.5) {
          const antennaH = h * 0.2;
          const antenna = new THREE.Mesh(boxGeo, antennaMat);
          antenna.scale.set(2, antennaH, 2);
          antenna.position.y = h + h2;
          buildingGroup.add(antenna);
        }
      }

      // Billboards
      if (h > 60 && Math.random() > 0.7) {
        const texIndex = Math.floor(Math.random() * billboardMaterials.length);
        const bbMat = billboardMaterials[texIndex];

        const bbW = 20 + Math.random() * 15;
        const bbH = 10 + Math.random() * 10;
        const bbGeo = new THREE.PlaneGeometry(bbW, bbH);

        const billboard = new THREE.Mesh(bbGeo, bbMat);

        // Position on a random face
        // 0: +Z, 1: -Z, 2: +X, 3: -X
        const face = Math.floor(Math.random() * 4);
        const offset = 1;

        if (face === 0) {
          // +Z
          billboard.position.set(
            0,
            h * (0.5 + Math.random() * 0.3),
            d / 2 + offset,
          );
        } else if (face === 1) {
          // -Z
          billboard.position.set(
            0,
            h * (0.5 + Math.random() * 0.3),
            -d / 2 - offset,
          );
          billboard.rotation.y = Math.PI;
        } else if (face === 2) {
          // +X
          billboard.position.set(
            w / 2 + offset,
            h * (0.5 + Math.random() * 0.3),
            0,
          );
          billboard.rotation.y = Math.PI / 2;
        } else {
          // -X
          billboard.position.set(
            -w / 2 - offset,
            h * (0.5 + Math.random() * 0.3),
            0,
          );
          billboard.rotation.y = -Math.PI / 2;
        }
        buildingGroup.add(billboard);
      }

      scene.add(buildingGroup);
      buildings.push(buildingGroup);
    }
  }

  // Cars
  const carGeo = new THREE.BoxGeometry(4, 2, 8);
  const tailLightGeo = new THREE.BoxGeometry(0.5, 0.5, 0.1);
  const headLightGeo = new THREE.BoxGeometry(0.5, 0.5, 0.1);

  // Reusable Car Materials
  const carBodyMat1 = new THREE.MeshLambertMaterial({ color: 0x222222 });
  const carBodyMat2 = new THREE.MeshLambertMaterial({ color: 0x050505 });
  const carBodyMat3 = new THREE.MeshLambertMaterial({ color: 0x111111 });

  const underglowGeo = new THREE.PlaneGeometry(5, 9);
  const underglowMat1 = new THREE.MeshBasicMaterial({
    color: 0xff00cc,
    opacity: 0.5,
    transparent: true,
    side,
  });
  const underglowMat2 = new THREE.MeshBasicMaterial({
    color: 0x00ccff,
    opacity: 0.5,
    transparent: true,
    side,
  });

  const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const headLightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });

  // Hitbox for easier selection
  const hitboxGeo = new THREE.BoxGeometry(20, 20, 30);
  const hitboxMat = new THREE.MeshBasicMaterial({
    color: 0xff0000, // THREE.Color doesn't matter (invisible)
    transparent: true,
    opacity: 0,
    depthWrite: false,
    visible: true,
  });

  for (let i = 0; i < CAR_COUNT; i++) {
    const isSpecial = Math.random() > 0.8;
    const bodyMat = (
      isSpecial ? carBodyMat1 .random() > 0.5 ? carBodyMat2 : carBodyMat3
    ).clone();
    bodyMat.transparent = true;

    // Car THREE.Group
    const carGroup = new THREE.Group();

    // Car Body
    const carBody = new THREE.Mesh(carGeo, bodyMat);
    carBody.userData.originalOpacity = 1.0;
    carGroup.add(carBody);

    // Underglow (Neon)
    if (Math.random() > 0.3) {
      const underglowMat = (
        Math.random() > 0.5 ? underglowMat1 : underglowMat2
      ).clone();
      const underglow = new THREE.Mesh(underglowGeo, underglowMat);
      underglow.userData.originalOpacity = 0.5;
      underglow.rotation.x = Math.PI / 2;
      underglow.position.y = -0.9;
      carGroup.add(underglow);
    }

    // Tail lights
    const tlMat = tailLightMat.clone();
    tlMat.transparent = true;
    const tl1 = new THREE.Mesh(tailLightGeo, tlMat);
    tl1.userData.originalOpacity = 1.0;
    tl1.position.set(1.5, 0, -4);
    carGroup.add(tl1);

    const tl2 = new THREE.Mesh(tailLightGeo, tlMat);
    tl2.userData.originalOpacity = 1.0;
    tl2.position.set(-1.5, 0, -4);
    carGroup.add(tl2);

    // Head lights
    const hlMat = headLightMat.clone();
    hlMat.transparent = true;
    const hl1 = new THREE.Mesh(headLightGeo, hlMat);
    hl1.userData.originalOpacity = 1.0;
    hl1.position.set(1.5, 0, 4);
    carGroup.add(hl1);

    const hl2 = new THREE.Mesh(headLightGeo, hlMat);
    hl2.userData.originalOpacity = 1.0;
    hl2.position.set(-1.5, 0, 4);
    carGroup.add(hl2);

    // Invisible Hitbox
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    hitbox.userData.originalOpacity = 0;
    carGroup.add(hitbox);

    // Use resetCar to set initial position and state
    carGroup.userData = {}; // init object
    resetCar(carGroup);

    scene.add(carGroup);
    cars.push(carGroup);
  }

  // Drone Swarm (formerly Starfield)
  const droneGeo = new THREE.BufferGeometry();
  const droneCount = 1000;
  const dronePositions = new Float32Array(droneCount * 3);
  const droneColorsArray = new Float32Array(droneCount * 3);
  droneTargetPositions = new Float32Array(droneCount * 3);
  droneBasePositions = new Float32Array(droneCount * 3);

  // Initialize Base Positions
  const baseRand = mulberry32(1337);
  for (let i = 0; i < droneCount; i++) {
    droneBasePositions[i * 3] = (baseRand() - 0.5) * 4000;
    droneBasePositions[i * 3 + 1] = 300 + baseRand() * 800;
    droneBasePositions[i * 3 + 2] = (baseRand() - 0.5) * 4000;
  }

  const dColor1 = new THREE.Color(0xff0000); // Red
  const dColor2 = new THREE.Color(0x00ffcc); // Cyan
  const dColor3 = new THREE.Color(0x00ff00); // Green
  const dColor4 = new THREE.Color(0xffffff); // White

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

  droneGeo.setAttribute("position", new THREE.BufferAttribute(dronePositions, 3));
  droneGeo.setAttribute("color", new THREE.BufferAttribute(droneColorsArray, 3));

  const droneMaterial = new THREE.PointsMaterial({
    size: 15, // Larger to see the texture
    map: createDroneTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false, // Better for transparency
    blending,
  });

  drones = new THREE.Points(droneGeo, droneMaterial);
  scene.add(drones);

  // Initialize Sparks
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));

  const sparkMat = new THREE.PointsMaterial({
    color: 0xffaa00,
    size: 3,
    transparent: true,
    opacity: 1,
    blending,
    sizeAttenuation: true,
    depthWrite: false,
  });

  sparks = new THREE.Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false; // Prevent culling when sparks fly outside initial bounds
  scene.add(sparks);

  createCheckpoint();
  createNavArrow();

  window.addEventListener("resize", onResize);
  window.addEventListener("click", onClick);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("mousemove", onMouseMove);
  // Pointer lock change
  document.addEventListener("pointerlockchange", onPointerLockChange);

  isActive = true;
  animate();

  // @ts-ignore
  window.__TEST_INTERFACE__ = {
    startDriving: () => {
      if (cars.length > 0) {
        isDrivingMode = true;
        // Emit game-start so App.vue fades out the overlay
        emit("game-start");
        activeCar = cars[0];
        cars[0].userData.isPlayerControlled = true;
        cars[0].userData.currentSpeed = 0;
        timeLeft = 30;
        lastTime = Date.now();
        spawnCheckpoint();
      }
    },
    getActiveCar: () => activeCar,
  };
});

function onKeyDown(event) {
  if (event.key === "Escape") {
    exitGameMode();
    return;
  }

  if (isExplorationMode && event.code === "Space" && !isJumping) {
    isJumping = true;
    velocityY = jumpStrength;
  }

  if (isDrivingMode || isExplorationMode) {
    switch (event.key.toLowerCase()) {
      case "w":
      case "arrowup":
        controls.forward = true;
        break;
      case "s":
      case "arrowdown":
        controls.backward = true;
        break;
      case "a":
      case "arrowleft":
        controls.left = true;
        break;
      case "d":
      case "arrowright":
        controls.right = true;
        break;
    }
  }
}

function onKeyUp(event) {
  if (isDrivingMode || isExplorationMode) {
    switch (event.key.toLowerCase()) {
      case "w":
      case "arrowup":
        controls.forward = false;
        break;
      case "s":
      case "arrowdown":
        controls.backward = false;
        break;
      case "a":
      case "arrowleft":
        controls.left = false;
        break;
      case "d":
      case "arrowright":
        controls.right = false;
        break;
    }
  }
}

// Seeded random number generator
function mulberry32(a) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate targets based on route
function generateDroneTargets(path) {
  if (isGameMode) return;
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
      // Fallback if base not ready (should not happen with current flow)
      droneTargetPositions[i * 3] = xOffset * 8; // approx 4000
      droneTargetPositions[i * 3 + 1] = 300 + (yOffset + 100) * 4;
      droneTargetPositions[i * 3 + 2] = zOffset * 8;
    }
  }
}

watch(
  () => route.path,
  (newPath) => {
    if (!isGameMode) {
      generateDroneTargets(newPath);
    }
  },
);

// watch removed => {
  if (oldCar) removeLightsFromCar(oldCar);
  if (newCar) addLightsToCar(newCar);
});

// watch removed => {
  if (val >= 500 && !isGameMode) {
    startTargetPractice();
  }
});

function startTargetPractice() {
  isGameMode = true;
  emit("game-start");

  // Initialize random velocities for drones
  const droneCount = 1000; // Must match init count
  droneVelocities = new Float32Array(droneCount * 3);

  for (let i = 0; i < droneCount; i++) {
    droneVelocities[i * 3] = (Math.random() - 0.5) * 8; // vx
    droneVelocities[i * 3 + 1] = (Math.random() - 0.5) * 4; // vy
    droneVelocities[i * 3 + 2] = (Math.random() - 0.5) * 8; // vz
  }
}

function startExplorationMode() {
  isGameMode = true;
  isExplorationMode = true;
  isTransitioning = true;
  emit("game-start");

  // Reset player rotation
  playerRotation.set(0, 0, 0);

  // Request pointer lock for desktop
  if (!isMobile && canvasContainer) {
    document.body.requestPointerLock();
  }
}

function startFlyingTour() {
  isGameMode = true;
  isFlyingTour = true;
  emit("game-start");
}

window.startExplorationMode = startExplorationMode; window.startFlyingTour = startFlyingTour;;

function exitGameMode() {
  controls.forward = false;
  controls.backward = false;
  controls.left = false;
  controls.right = false;

  lookControls.up = false;
  lookControls.down = false;
  lookControls.left = false;
  lookControls.right = false;

  if (isDrivingMode) {
    isDrivingMode = false;
    carAudio.stop(); // Stop engine sound
    if (activeCar) {
      activeCar.userData.isPlayerControlled = false;
      activeCar = null;
    }
  }

  if (isExplorationMode) {
    isExplorationMode = false;
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  if (isFlyingTour) {
    isFlyingTour = false;
  }

  isGameMode = false;
  score = 0;
  emit("game-end");

  // Restore dead drones
  deadDrones.clear();

  // Reset positions to targets to avoid them streaking across screen
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

function onClick(event) {
  if (!camera) return;

  if (isExplorationMode && !isMobile) {
    // Re-request pointer lock if clicked during exploration
    if (document.pointerLockElement !== document.body) {
      document.body.requestPointerLock();
    }
    return;
  }

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  // If not in a game mode, check for cars
  if (!isGameMode && !isDrivingMode) {
    // Traverse cars to get meshes
    const carMeshes = [];
    cars.forEach((c) =>
      c.traverse((child) => {
        if (child instanceof THREE.Mesh) carMeshes.push(child);
      }),
    );

    const carIntersects = raycaster.intersectObjects(carMeshes);
    if (carIntersects.length > 0) {
      const hit = carIntersects[0].object;
      // Traverse up to find THREE.Group
      let target = hit;
      while (target.parent && target.parent.type !== "THREE.Scene") {
        target = target.parent;
      }

      if (target instanceof THREE.Group && target.userData.speed !== undefined) {
        // Found a car
        isDrivingMode = true;
        emit("game-start");
        carAudio.start(); // Start engine sound
        activeCar = target;
        target.userData.isPlayerControlled = true;
        target.userData.currentSpeed = target.userData.speed;

        // Initialize Racing Mode
        timeLeft = 30;
        lastTime = Date.now();
        score = 0; // Reset score for new run
        spawnCheckpoint();

        // Preserve current rotation as base
        return;
      }
    }
  }

  if (drones && !isExplorationMode) {
    raycaster.params.THREE.Points.threshold = 20; // Increased threshold
    const intersects = raycaster.intersectObject(drones);

    if (intersects.length > 0) {
      // Sort by distance (default behavior of intersectObject usually, but good to be sure)
      // intersects.sort((a, b) => a.distance - b.distance);

      const intersect = intersects[0];
      const index = intersect.index;

      if (index !== undefined && !deadDrones.has(index)) {
        const posAttribute = drones.geometry.attributes.position;
        const x = posAttribute.getX(index);
        const y = posAttribute.getY(index);
        const z = posAttribute.getZ(index);

        console.log("Hit drone at", x, y, z);
        // Spawn explosion
        spawnSparks(new THREE.Vector3(x, y, z));

        // Hide drone (move far away)
        posAttribute.setXYZ(index, 0, -99999, 0);
        posAttribute.needsUpdate = true;

        deadDrones.add(index);

        playPewSound();
        score += 100;
      }
    }
  }
}

function onMouseMove(event) {
  if (
    isExplorationMode &&
    !isMobile &&
    document.pointerLockElement === document.body
  ) {
    const sensitivity = 0.002;
    playerRotation.y -= event.movementX * sensitivity;
    playerRotation.x -= event.movementY * sensitivity;

    // Clamp pitch
    playerRotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, playerRotation.x),
    );

    camera.rotation.copy(playerRotation);
  }
}

function animate() {
  if (!isActive) return;
  animationId = requestAnimationFrame(animate);

  const now = Date.now();
  const time = now * 0.0005;
  const deltaTime = 0.016; // approximate

  // Racing Logic
  if (isDrivingMode && activeCar) {
    // Timer
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    timeLeft -= dt;

    if (timeLeft <= 0) {
      timeLeft = 0;
      exitGameMode(); // Time's up
    } else {
      // Checkpoint Collision
      // Flatten distance check (ignore Y)
      const cx = activeCar.position.x;
      const cz = activeCar.position.z;
      const tx = checkpointMesh.position.x;
      const tz = checkpointMesh.position.z;

      const distSq = (cx - tx) ** 2 + (cz - tz) ** 2;
      const dist = Math.sqrt(distSq);
      distToTarget = dist;

      if (distSq < 20 * 20) {
        // 20 units radius
        // Checkpoint reached
        score += 500;
        timeLeft += 15; // Bonus time
        playPewSound(); // Reuse sound
        spawnCheckpoint();
      }

      // Update Nav Arrow
      navArrow.visible = true;
      navArrow.position.copy(activeCar.position);
      navArrow.position.y += 15; // Hover above car
      navArrow.lookAt(
        checkpointMesh.position.x,
        navArrow.position.y,
        checkpointMesh.position.z,
      );
    }
  } else {
    if (navArrow) navArrow.visible = false;
    if (checkpointMesh) checkpointMesh.visible = false;
    // Keep lastTime updated so we don't have a huge jump when starting
    lastTime = now;
  }

  // Handle Exploration Mode
  if (isExplorationMode) {
    if (isTransitioning) {
      const targetPos = new THREE.Vector3(0, 1.8, 0);
      const targetQ = new THREE.Quaternion().setFromEuler(playerRotation);

      camera.position.lerp(targetPos, 0.05);
      camera.quaternion.slerp(targetQ, 0.05);

      if (camera.position.distanceTo(targetPos) < 1) {
        isTransitioning = false;
        camera.position.copy(targetPos);
        camera.rotation.copy(playerRotation);
      }
    } else {
      const speed = 2.0; // walking speed

      const direction = new THREE.Vector3();
      const frontVector = new THREE.Vector3(
        0,
        0,
        Number(controls.backward) - Number(controls.forward),
      );
      const sideVector = new THREE.Vector3(
        Number(controls.left) - Number(controls.right),
        0,
        0,
      );

      // Handle look buttons on mobile
      if (isMobile) {
        const rotateSpeed = 0.03;
        if (lookControls.left) playerRotation.y += rotateSpeed;
        if (lookControls.right) playerRotation.y -= rotateSpeed;
        if (lookControls.up) playerRotation.x += rotateSpeed;
        if (lookControls.down) playerRotation.x -= rotateSpeed;

        // Clamp pitch
        playerRotation.x = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, playerRotation.x),
        );
        camera.rotation.copy(playerRotation);
      }

      direction
        .subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(speed)
        .applyEuler(new THREE.Euler(0, camera.rotation.y, 0));

      const nextX = camera.position.x + direction.x;
      const nextZ = camera.position.z + direction.z;

      // Collision Check with Grid
      const ix = Math.round((nextX - startOffset) / CELL_SIZE);
      const iz = Math.round((nextZ - startOffset) / CELL_SIZE);
      let collided = false;

      if (occupiedGrids.has(`${ix},${iz}`)) {
        const cX = startOffset + ix * CELL_SIZE;
        const cZ = startOffset + iz * CELL_SIZE;
        const dims = occupiedGrids.get(`${ix},${iz}`);
        if (dims) {
          if (
            Math.abs(nextX - cX) < dims.halfW + 2 &&
            Math.abs(nextZ - cZ) < dims.halfD + 2
          ) {
            collided = true;
          }
        }
      }

      if (!collided) {
        camera.position.x = nextX;
        camera.position.z = nextZ;
      }

      // Bounds check
      if (camera.position.x > BOUNDS) camera.position.x = -BOUNDS;
      if (camera.position.x < -BOUNDS) camera.position.x = BOUNDS;
      if (camera.position.z > BOUNDS) camera.position.z = -BOUNDS;
      if (camera.position.z < -BOUNDS) camera.position.z = BOUNDS;

      // Bobbing and Jumping

      if (isJumping) {
        camera.position.y += velocityY;

        velocityY -= gravity;

        if (camera.position.y <= groundPosition) {
          camera.position.y = groundPosition;

          isJumping = false;

          velocityY = 0;
        }
      } else {
        if (
          controls.forward ||
          controls.backward ||
          controls.left ||
          controls.right
        ) {
          camera.position.y =
            groundPosition + Math.sin(Date.now() * 0.01) * 0.1;
        } else {
          camera.position.y = groundPosition;
        }
      }

      // Check collisions with cars
      const hitDistSq = 15 * 15;
      for (let i = 0; i < cars.length; i++) {
        const car = cars[i];
        const distSq = camera.position.distanceToSquared(car.position);

        if (distSq < hitDistSq) {
          if (!car.userData.isPlayerHit) {
            car.userData.isPlayerHit = true;
            carAudio.playCrash();
          }
        } else {
          if (car.userData.isPlayerHit) {
            car.userData.isPlayerHit = false;
          }
        }
      }
    }
  }

  // Move cars & Handle Collisions

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];

    // Player Control Logic
    if (car.userData.isPlayerControlled) {
      let speed = car.userData.currentSpeed || 0;
      const maxSpeed = 2;
      const acceleration = 0.1;
      const friction = 0.98;
      const turnSpeed = 0.02;

      // Gas / Brake
      if (controls.forward) {
        speed += acceleration;
      } else if (controls.backward) {
        speed -= acceleration;
      }

      // Friction
      speed *= friction;

      // Max Speed Cap
      if (speed > maxSpeed) speed = maxSpeed;
      if (speed < -maxSpeed / 2) speed = -maxSpeed / 2;

      car.userData.currentSpeed = speed;

      // Update Audio
      carAudio.update(speed);

      // Steering (only if moving)
      if (Math.abs(speed) > 0.1) {
        const dir = speed > 0 ? 1 : -1;
        if (controls.left) {
          car.rotation.y += turnSpeed * dir;
        }
        if (controls.right) {
          car.rotation.y -= turnSpeed * dir;
        }
      }

      // Apply Velocity
      car.position.x += Math.sin(car.rotation.y) * speed;
      car.position.z += Math.cos(car.rotation.y) * speed;

      // Simple Bounds Check
      if (
        car.position.x > BOUNDS ||
        car.position.x < -BOUNDS ||
        car.position.z > BOUNDS ||
        car.position.z < -BOUNDS
      ) {
        // Wrap around? Or stop?
        // Let's wrap around for endless driving
        if (car.position.x > BOUNDS) car.position.x = -BOUNDS;
        if (car.position.x < -BOUNDS) car.position.x = BOUNDS;
        if (car.position.z > BOUNDS) car.position.z = -BOUNDS;
        if (car.position.z < -BOUNDS) car.position.z = BOUNDS;
      }

      // Building Collision (Simple Box Check)
      // Uses grid logic similar to sparks
      const ix = Math.round((car.position.x - startOffset) / CELL_SIZE);
      const iz = Math.round((car.position.z - startOffset) / CELL_SIZE);

      if (occupiedGrids.has(`${ix},${iz}`)) {
        const cX = startOffset + ix * CELL_SIZE;
        const cZ = startOffset + iz * CELL_SIZE;
        const dims = occupiedGrids.get(`${ix},${iz}`);

        // Approx building half-width + car half-width (radius ~5)
        if (
          dims &&
          Math.abs(car.position.x - cX) < dims.halfW + 5 &&
          Math.abs(car.position.z - cZ) < dims.halfD + 5
        ) {
          // Collision - Bounce
          car.userData.currentSpeed *= -0.5;
          carAudio.playCrash();
          // Push out slightly
          const dx = car.position.x - cX;
          const dz = car.position.z - cZ;
          car.position.x += Math.sign(dx) * 2;
          car.position.z += Math.sign(dz) * 2;

          spawnSparks(car.position);
        }
      }
    } else if (!car.userData.fading) {
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
      // Move slightly slower while fading? Or just drift
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
          if (child instanceof THREE.Mesh) {
            const mat = child.material;
            if (!Array.isArray(mat)) {
              // Scale current opacity relative to original
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

  // Check Collisions (naive O(N^2) but N=150 is fine)
  // Only check non-fading cars
  // Reduced collision rate by decreasing collision distance threshold slightly
  // and adding a random chance check
  const actualCollisionDist = 6;

  for (let i = 0; i < cars.length; i++) {
    const carA = cars[i];
    if (carA.userData.fading) continue;

    for (let j = i + 1; j < cars.length; j++) {
      const carB = cars[j];
      if (carB.userData.fading) continue;

      // If one is player controlled, we handle collision differently?
      // For now, treat same collision (explode/fade both)
      // But maybe give player immunity or just bounce?

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

        // Bounce (reverse direction)
        carA.userData.dir *= -1;
        carB.userData.dir *= -1;

        // Slight visual bounce effect?
        // Maybe rotate them a bit to look like a crash
        carA.rotation.y += Math.random() - 0.5;
        carB.rotation.y += Math.random() - 0.5;

        // Spawn sparks at midpoint
        // const midX = (carA.position.x + carB.position.x) / 2;
        // const midZ = (carA.position.z + carB.position.z) / 2;
        // spawnSparks(new THREE.Vector3(midX, 2, midZ));
      }
    }
  }

  // Update Sparks
  if (sparks) {
    const positions = sparks.geometry.attributes.position.array;
    let needsUpdate = false;

    for (let i = 0; i < sparkCount; i++) {
      if (sparkLifetimes[i] > 0) {
        // Gravity and movement
        sparkVelocities[i * 3 + 1] -= 0.1; // gravity

        positions[i * 3] += sparkVelocities[i * 3];
        positions[i * 3 + 1] += sparkVelocities[i * 3 + 1];
        positions[i * 3 + 2] += sparkVelocities[i * 3 + 2];

        // Ground collision
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 0;
          sparkVelocities[i * 3 + 1] *= -0.5; // bounce
        }

        // Building Collision (approximate)
        // Buildings are centered at startOffset + k * CELL_SIZE
        const ix = Math.round((positions[i * 3] - startOffset) / CELL_SIZE);
        const iz = Math.round((positions[i * 3 + 2] - startOffset) / CELL_SIZE);

        if (occupiedGrids.has(`${ix},${iz}`)) {
          const cX = startOffset + ix * CELL_SIZE;
          const cZ = startOffset + iz * CELL_SIZE;
          const dims = occupiedGrids.get(`${ix},${iz}`);

          if (
            dims &&
            Math.abs(positions[i * 3] - cX) < dims.halfW &&
            Math.abs(positions[i * 3 + 2] - cZ) < dims.halfD
          ) {
            // Hit building
            sparkLifetimes[i] = 0;
          }
        }

        sparkLifetimes[i] -= 0.02; // decay
        if (sparkLifetimes[i] < 0) {
          sparkLifetimes[i] = 0;
          // Hide below ground
          positions[i * 3 + 1] = -100;
        }
        needsUpdate = true;
      }
    }
    if (needsUpdate) {
      sparks.geometry.attributes.position.needsUpdate = true;
    }
  }

  // Move drones
  if (drones) {
    const positions = drones.geometry.attributes.position.array;

    if (isGameMode && droneVelocities) {
      // Game Mode based movement
      for (let i = 0; i < positions.length / 3; i++) {
        if (deadDrones.has(i)) continue;

        positions[i * 3] += droneVelocities[i * 3];
        positions[i * 3 + 1] += droneVelocities[i * 3 + 1];
        positions[i * 3 + 2] += droneVelocities[i * 3 + 2];

        // Bounds check (wrap around)
        const range = 2000;
        if (positions[i * 3] > range) positions[i * 3] = -range;
        if (positions[i * 3] < -range) positions[i * 3] = range;

        if (positions[i * 3 + 1] > 1000) positions[i * 3 + 1] = 0;
        if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 1000;

        if (positions[i * 3 + 2] > range) positions[i * 3 + 2] = -range;
        if (positions[i * 3 + 2] < -range) positions[i * 3 + 2] = range;
      }
    } else if (droneTargetPositions) {
      // Standard Mode around target
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
    }
    drones.geometry.attributes.position.needsUpdate = true;
  }

  // Camera movement
  if (isDrivingMode && activeCar) {
    // Follow the car
    const car = activeCar;
    const angle = car.rotation.y;
    const dist = 40;
    const height = 20;

    const targetX = car.position.x - Math.sin(angle) * dist;
    const targetZ = car.position.z - Math.cos(angle) * dist;
    const targetY = car.position.y + height;

    // Smooth follow
    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.z += (targetZ - camera.position.z) * 0.1;
    camera.position.y += (targetY - camera.position.y) * 0.1;

    camera.lookAt(car.position.x, car.position.y, car.position.z);
  } else if (isFlyingTour) {
    // Flying Tour Mode
    const tourSpeed = 0.15;

    // More complex path-8ish / weaving
    // Main circular orbit
    const xBase = Math.sin(time * tourSpeed) * 1200;
    const zBase = Math.cos(time * tourSpeed) * 800;

    // Secondary wave for weaving
    const xWeave = Math.sin(time * tourSpeed * 3) * 300;

    camera.position.x = xBase + xWeave;
    camera.position.z = zBase;

    // Dynamic height down and up
    // Base height 250, amplitude 150. Go between 100 and 400.
    camera.position.y = 250 + Math.sin(time * tourSpeed * 2) * 150;

    // Look ahead logic
    // Calculate derivative (approx velocity direction)
    const delta = 0.1;
    const futureTime = time + delta;

    const fxBase = Math.sin(futureTime * tourSpeed) * 1200;
    const fzBase = Math.cos(futureTime * tourSpeed) * 800;
    const fxWeave = Math.sin(futureTime * tourSpeed * 3) * 300;

    const nextX = fxBase + fxWeave;
    const nextZ = fzBase;
    const nextY = 250 + Math.sin(futureTime * tourSpeed * 2) * 150;

    camera.lookAt(nextX, nextY, nextZ);

    // Banking effect (roll)
    // Roll based on turn sharpness?
    // Simplified towards center of turn.
    // We can just rely on lookAt for pitch/yaw, but maybe add slight roll if we were using quaternions manually.
    // For now, lookAt next position gives a nice "flight" feeling compared to looking at 0,0,0.

  } else if (!isExplorationMode) {
    // Standard Orbit
    const orbitRadius = isMobile ? 1400 : 800;
    camera.position.x = Math.sin(time * 0.1) * orbitRadius;
    camera.position.z = Math.cos(time * 0.1) * orbitRadius;

    // Recalculate Y if we were in driving mode
    const targetY = isMobile ? 350 : 250;
    if (Math.abs(camera.position.y - targetY) > 1) {
      camera.position.y += (targetY - camera.position.y) * 0.05;
    }

    const targetLookAt = isGameMode
      ? new THREE.Vector3(0, 500, 0)
      : new THREE.Vector3(0, 0, 0);
    currentLookAt.lerp(targetLookAt, 0.02);
    camera.lookAt(currentLookAt);
  }

  renderer.render(scene, camera); if(updateStateCallback) updateStateCallback({ score, timeLeft, distToTarget, isGameMode, isDrivingMode, isExplorationMode, isFlyingTour });
}

let audioCtx | null = null;

function playPewSound() {
  const AudioContext =
    window.AudioContext || (window).webkitAudioContext;
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

window.cleanupCyberpunkCity = function() {
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
});

})();
