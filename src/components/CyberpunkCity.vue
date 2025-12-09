<template>
  <div ref="canvasContainer" id="cyberpunk-city"></div>
  <div id="score-counter">SCORE: {{ score }}</div>
  <button v-if="isGameMode" id="return-button" @click="exitGameMode">RETURN</button>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { AdditiveBlending, AmbientLight, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, Color, DirectionalLight, DoubleSide, EdgesGeometry, FogExp2, Group, InterleavedBufferAttribute, Line, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, MeshLambertMaterial, NearestFilter, Object3D, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, Raycaster, RepeatWrapping, Scene, Vector2, Vector3, WebGLRenderer } from "three";

const canvasContainer = ref<HTMLDivElement | null>(null);

let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let animationId: number;
let isActive = false;

const buildings: Object3D[] = [];
// Fix: cars are Group objects
const cars: Group[] = [];

let drones: Points;
let droneTargetPositions: Float32Array;
let droneBasePositions: Float32Array;
const deadDrones = new Set<number>();
const score = ref(0);
const isGameMode = ref(false);
const emit = defineEmits(['game-start']);
let droneVelocities: Float32Array;
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

// Configuration
const CITY_SIZE = 2000;
const BLOCK_SIZE = 150;
const ROAD_WIDTH = 40;
const CELL_SIZE = BLOCK_SIZE + ROAD_WIDTH;

const GRID_SIZE = Math.floor(CITY_SIZE / CELL_SIZE);
// We will generate a grid of buildings.
// Grid range: -GRID_SIZE/2 to GRID_SIZE/2
const startOffset = -(GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2;

const CAR_COUNT = 150;

// Function to reset/spawn a car
function resetCar(carGroup: Group) {
    const axis = Math.random() > 0.5 ? 'x' : 'z';
    const dir = Math.random() > 0.5 ? 1 : -1;

    const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
    const roadCoordinate = startOffset + roadIndex * CELL_SIZE - CELL_SIZE / 2;

    const laneOffset = (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

    let x = 0, z = 0;

    if (axis === 'x') {
        z = roadCoordinate + laneOffset;
        x = (Math.random() - 0.5) * CITY_SIZE;
        carGroup.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
    } else {
        x = roadCoordinate + laneOffset;
        z = (Math.random() - 0.5) * CITY_SIZE;
        carGroup.rotation.y = dir === 1 ? 0 : Math.PI;
    }

    carGroup.position.set(x, 1, z);

    carGroup.userData.speed = 1 + Math.random() * 2;
    carGroup.userData.dir = dir;
    carGroup.userData.axis = axis;
    carGroup.userData.laneOffset = laneOffset;
    carGroup.userData.collided = false;
    carGroup.userData.fading = false;
    carGroup.userData.opacity = 1.0;
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
}

// Reusable Texture for Windows
function createWindowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#020202';
        ctx.fillRect(0, 0, 32, 64);
        // random windows
        for (let y = 2; y < 64; y += 4) {
            for (let x = 2; x < 32; x += 4) {
               if (Math.random() > 0.6) {
                   ctx.fillStyle = Math.random() > 0.5 ? '#ff00cc' : '#00ccff';
                   ctx.fillRect(x, y, 2, 2);
               }
            }
        }
    }
    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.magFilter = NearestFilter;
    return texture;
}

// Generate Billboard Textures
function createBillboardTextures() {
    const textures: CanvasTexture[] = [];
    for (let i = 0; i < 5; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Dark background
            ctx.fillStyle = '#100010';
            ctx.fillRect(0, 0, 128, 64);

            // Neon border
            const colors = ['#ff00cc', '#00ffcc', '#ffff00', '#ff0000', '#00ff00'];
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
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(32, 32, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = color;
                ctx.fillRect(64, 20, 40, 24);
            } else {
                // Random blocks
                for(let k=0; k<5; k++) {
                    ctx.fillRect(
                        10 + Math.random() * 100,
                        10 + Math.random() * 40,
                        10 + Math.random() * 20,
                        5 + Math.random() * 10
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
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.clearRect(0,0,32,32);

        // Drone body (Quadcopter silhouette)
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(4, 4);
        ctx.lineTo(28, 28);
        ctx.moveTo(28, 4);
        ctx.lineTo(4, 28);
        ctx.stroke();

        // Rotors
        ctx.fillStyle = '#444444';
        ctx.beginPath(); ctx.arc(4, 4, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(28, 4, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(4, 28, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(28, 28, 3, 0, Math.PI*2); ctx.fill();

        // Central Light (White, to be tinted by vertex color)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(16, 16, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    const texture = new CanvasTexture(canvas);
    return texture;
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

function activateSpark(i: number, position: Vector3, posAttribute: BufferAttribute | InterleavedBufferAttribute) {
    sparkLifetimes[i] = 1.0;

    // Set position
    posAttribute.setXYZ(i, position.x, position.y, position.z);

    // Random velocity
    sparkVelocities[i*3] = (Math.random() - 0.5) * 5;     // vx
    sparkVelocities[i*3+1] = Math.random() * 5 + 2;     // vy (upwards)
    sparkVelocities[i*3+2] = (Math.random() - 0.5) * 5;   // vz
}

onMounted(() => {
  if (!canvasContainer.value) return;

  // Scene setup
  scene = new Scene();
  scene.background = new Color(0x050510);
  scene.fog = new FogExp2(0x050510, 0.001); // Reduced fog density

  // Camera setup
  camera = new PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    3000
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
  const planeGeometry = new PlaneGeometry(CITY_SIZE * 2, CITY_SIZE * 2);
  const planeMaterial = new MeshBasicMaterial({ color: 0x0a0a15 });
  const plane = new Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.5;
  scene.add(plane);

  // Generate City Grid
  // const startOffset = -(GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2; // Moved to top
  const windowTexture = createWindowTexture();
  const billboardTextures = createBillboardTextures();

  const boxGeo = new BoxGeometry(1, 1, 1);
  boxGeo.translate(0, 0.5, 0); // pivot at bottom

  const edgesGeo = new EdgesGeometry(boxGeo);

  // Reusable Materials
  const buildingMaterial = new MeshLambertMaterial({
      color: 0x222222,
      map: windowTexture
  });

  const edgeMat1 = new LineBasicMaterial({ color: 0xff00cc, transparent: true, opacity: 0.4 });
  const edgeMat2 = new LineBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.4 });
  const topEdgeMat = new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
  const antennaMat = new MeshBasicMaterial({ color: 0xffffff });

  const billboardMaterials = billboardTextures.map(tex => new MeshBasicMaterial({
      map: tex,
      side: DoubleSide,
      transparent: true,
      opacity: 0.9
  }));

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
        // Skip some blocks for variety
        if (Math.random() > 0.8) continue;

        const xPos = startOffset + x * CELL_SIZE;
        const zPos = startOffset + z * CELL_SIZE;

        const h = 40 + Math.random() * 120; // Slightly taller minimum
        const w = BLOCK_SIZE - 10 - Math.random() * 20;
        const d = BLOCK_SIZE - 10 - Math.random() * 20;

        const buildingGroup = new Group();
        buildingGroup.position.set(xPos, 0, zPos);

        // Main Block
        const mainBlock = new Mesh(boxGeo, buildingMaterial);
        mainBlock.scale.set(w, h, d);
        buildingGroup.add(mainBlock);

        // Edges for Main Block
        const line = new LineSegments(
            edgesGeo,
            Math.random() > 0.5 ? edgeMat1 : edgeMat2
        );
        line.scale.set(w, h, d);
        buildingGroup.add(line);

        // Top Structure (for taller buildings)
        if (h > 100 && Math.random() > 0.4) {
            const h2 = h * 0.3;
            const w2 = w * 0.6;
            const d2 = d * 0.6;

            const topBlock = new Mesh(boxGeo, buildingMaterial);
            topBlock.scale.set(w2, h2, d2);
            topBlock.position.y = h;
            buildingGroup.add(topBlock);

            const topLine = new LineSegments(
                edgesGeo,
                topEdgeMat
            );
            topLine.scale.set(w2, h2, d2);
            topLine.position.y = h;
            buildingGroup.add(topLine);

            // Antenna
            if (Math.random() > 0.5) {
                const antennaH = h * 0.2;
                const antenna = new Mesh(boxGeo, antennaMat);
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
            const bbGeo = new PlaneGeometry(bbW, bbH);

            const billboard = new Mesh(bbGeo, bbMat);

            // Position on a random face
            // 0: +Z, 1: -Z, 2: +X, 3: -X
            const face = Math.floor(Math.random() * 4);
            const offset = 1;

            if (face === 0) { // +Z
                billboard.position.set(0, h * (0.5 + Math.random() * 0.3), d/2 + offset);
            } else if (face === 1) { // -Z
                billboard.position.set(0, h * (0.5 + Math.random() * 0.3), -d/2 - offset);
                billboard.rotation.y = Math.PI;
            } else if (face === 2) { // +X
                billboard.position.set(w/2 + offset, h * (0.5 + Math.random() * 0.3), 0);
                billboard.rotation.y = Math.PI / 2;
            } else { // -X
                billboard.position.set(-w/2 - offset, h * (0.5 + Math.random() * 0.3), 0);
                billboard.rotation.y = -Math.PI / 2;
            }
            buildingGroup.add(billboard);
        }

        scene.add(buildingGroup);
        buildings.push(buildingGroup);
    }
  }

  // Add Road Markings (Simple Lines)
  const lineMaterial = new LineBasicMaterial({ color: 0x444444 });

  for (let i = 0; i <= GRID_SIZE; i++) {
      const pos = startOffset + i * CELL_SIZE - CELL_SIZE / 2;

      // Road line geometry (Along Z)
      const points = [];
      points.push(new Vector3(pos, 0.1, -CITY_SIZE));
      points.push(new Vector3(pos, 0.1, CITY_SIZE));
      const geometry = new BufferGeometry().setFromPoints(points);
      const line = new Line(geometry, lineMaterial);
      scene.add(line);

      // Road line geometry (Along X)
      const points2 = [];
      points2.push(new Vector3(-CITY_SIZE, 0.1, pos));
      points2.push(new Vector3(CITY_SIZE, 0.1, pos));
      const geometry2 = new BufferGeometry().setFromPoints(points2);
      const line2 = new Line(geometry2, lineMaterial);
      scene.add(line2);
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
  const underglowMat1 = new MeshBasicMaterial({ color: 0xff00cc, opacity: 0.5, transparent: true, side: DoubleSide });
  const underglowMat2 = new MeshBasicMaterial({ color: 0x00ccff, opacity: 0.5, transparent: true, side: DoubleSide });

  const tailLightMat = new MeshBasicMaterial({ color: 0xff0000 });
  const headLightMat = new MeshBasicMaterial({ color: 0xffffaa });

  for (let i = 0; i < CAR_COUNT; i++) {
    const isSpecial = Math.random() > 0.8;
    const bodyMat = (isSpecial ? carBodyMat1 : (Math.random() > 0.5 ? carBodyMat2 : carBodyMat3)).clone();
    bodyMat.transparent = true;

    // Car Group
    const carGroup = new Group();

    // Car Body
    const carBody = new Mesh(carGeo, bodyMat);
    carBody.userData.originalOpacity = 1.0;
    carGroup.add(carBody);

    // Underglow (Neon)
    if (Math.random() > 0.3) {
      const underglowMat = (Math.random() > 0.5 ? underglowMat1 : underglowMat2).clone();
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
    tl1.position.set(1.5, 0, 4);
    carGroup.add(tl1);

    const tl2 = new Mesh(tailLightGeo, tlMat);
    tl2.userData.originalOpacity = 1.0;
    tl2.position.set(-1.5, 0, 4);
    carGroup.add(tl2);

    // Head lights
    const hlMat = headLightMat.clone();
    hlMat.transparent = true;
    const hl1 = new Mesh(headLightGeo, hlMat);
    hl1.userData.originalOpacity = 1.0;
    hl1.position.set(1.5, 0, -4);
    carGroup.add(hl1);

    const hl2 = new Mesh(headLightGeo, hlMat);
    hl2.userData.originalOpacity = 1.0;
    hl2.position.set(-1.5, 0, -4);
    carGroup.add(hl2);

    // Use resetCar to set initial position and state
    carGroup.userData = {}; // init object
    resetCar(carGroup);

    scene.add(carGroup);
    cars.push(carGroup);
  }

  // Drone Swarm (formerly Starfield)
  const droneGeo = new BufferGeometry();
  const droneCount = 1000;
  const dronePositions = new Float32Array(droneCount * 3);
  const droneColorsArray = new Float32Array(droneCount * 3);
  droneTargetPositions = new Float32Array(droneCount * 3);
  droneBasePositions = new Float32Array(droneCount * 3);

  // Initialize Base Positions
  const baseRand = mulberry32(1337);
  for (let i = 0; i < droneCount; i++) {
      droneBasePositions[i*3] = (baseRand() - 0.5) * 4000;
      droneBasePositions[i*3+1] = 300 + baseRand() * 800;
      droneBasePositions[i*3+2] = (baseRand() - 0.5) * 4000;
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

  droneGeo.setAttribute('position', new BufferAttribute(dronePositions, 3));
  droneGeo.setAttribute('color', new BufferAttribute(droneColorsArray, 3));

  const droneMaterial = new PointsMaterial({
    size: 15, // Larger to see the texture
    map: createDroneTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false, // Better for transparency
    blending: AdditiveBlending
  });

  drones = new Points(droneGeo, droneMaterial);
  scene.add(drones);

  // Initialize Sparks
  const sparkGeo = new BufferGeometry();
  sparkGeo.setAttribute('position', new BufferAttribute(sparkPositions, 3));

  const sparkMat = new PointsMaterial({
      color: 0xffaa00,
      size: 3,
      transparent: true,
      opacity: 1,
      blending: AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false
  });

  sparks = new Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false; // Prevent culling when sparks fly outside initial bounds
  scene.add(sparks);

  window.addEventListener("resize", onResize);
  window.addEventListener("click", onClick);
  isActive = true;
  animate();
});



// Seeded random number generator
function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

// Generate targets based on route
function generateDroneTargets(path: string) {
    if (isGameMode.value) return;
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
            droneTargetPositions[i*3] = droneBasePositions[i*3] + xOffset;
            droneTargetPositions[i*3+1] = droneBasePositions[i*3+1] + yOffset;
            droneTargetPositions[i*3+2] = droneBasePositions[i*3+2] + zOffset;
        } else {
             // Fallback if base not ready (should not happen with current flow)
            droneTargetPositions[i*3] = xOffset * 8; // approx 4000
            droneTargetPositions[i*3+1] = 300 + (yOffset + 100) * 4;
            droneTargetPositions[i*3+2] = zOffset * 8;
        }
    }
}

watch(
  () => route.path,
  (newPath) => {
    if (!isGameMode.value) {
      generateDroneTargets(newPath);
    }
  }
);

watch(score, (val) => {
  if (val >= 500 && !isGameMode.value) {
    startTargetPractice();
  }
});

function startTargetPractice() {
  isGameMode.value = true;
  emit('game-start');

  // Initialize random velocities for drones
  const droneCount = 1000; // Must match init count
  droneVelocities = new Float32Array(droneCount * 3);

  for(let i=0; i<droneCount; i++) {
     droneVelocities[i*3] = (Math.random() - 0.5) * 8; // vx
     droneVelocities[i*3+1] = (Math.random() - 0.5) * 4; // vy
     droneVelocities[i*3+2] = (Math.random() - 0.5) * 8; // vz
  }
}

function exitGameMode() {
  isGameMode.value = false;
  score.value = 0;
}

function onResize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick(event: MouseEvent) {
    if (!drones || !camera) return;

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    raycaster.params.Points.threshold = 20; // Increased threshold

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
            spawnSparks(new Vector3(x, y, z));

            // Hide drone (move far away)
            posAttribute.setXYZ(index, 0, -99999, 0);
            posAttribute.needsUpdate = true;
            
            deadDrones.add(index);

            playPewSound();
            score.value += 100;
        }
    }
}

function animate() {
  if (!isActive) return;
  animationId = requestAnimationFrame(animate);

  const time = Date.now() * 0.0005;
  const bound = (GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE;

  // Move cars & Handle Collisions

  for (let i = 0; i < cars.length; i++) {
      const car = cars[i];

      // Movement
      if (!car.userData.fading) {
          if (car.userData.axis === 'x') {
            car.position.x += car.userData.speed * car.userData.dir;
            if (car.position.x > bound) car.position.x = -bound;
            if (car.position.x < -bound) car.position.x = bound;
          } else {
            car.position.z += car.userData.speed * car.userData.dir;
            if (car.position.z > bound) car.position.z = -bound;
            if (car.position.z < -bound) car.position.z = bound;
          }
      } else {
          // Fading out logic
          // Move slightly slower while fading? Or just drift
           if (car.userData.axis === 'x') {
            car.position.x += (car.userData.speed * 0.5) * car.userData.dir;
          } else {
            car.position.z += (car.userData.speed * 0.5) * car.userData.dir;
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
                           // Scale current opacity relative to original
                           const original = child.userData.originalOpacity || 1.0;
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

          const dx = carA.position.x - carB.position.x;
          const dz = carA.position.z - carB.position.z;
          const distSq = dx*dx + dz*dz;

          if (distSq < actualCollisionDist * actualCollisionDist) {
              // Additional check to reduce collision rate
              if (Math.random() > 0.5) continue;

              // Collision!
              carA.userData.fading = true;
              carB.userData.fading = true;

              // Bounce (reverse direction)
              carA.userData.dir *= -1;
              carB.userData.dir *= -1;

              // Slight visual bounce effect?
              // Maybe rotate them a bit to look like a crash
              carA.rotation.y += (Math.random() - 0.5);
              carB.rotation.y += (Math.random() - 0.5);

              // Spawn sparks at midpoint
              // const midX = (carA.position.x + carB.position.x) / 2;
              // const midZ = (carA.position.z + carB.position.z) / 2;
              // spawnSparks(new Vector3(midX, 2, midZ));
          }
      }
  }

  // Update Sparks
  if (sparks) {
      const positions = sparks.geometry.attributes.position.array;
      let needsUpdate = false;

      for(let i=0; i<sparkCount; i++) {
          if (sparkLifetimes[i] > 0) {
              // Gravity and movement
              sparkVelocities[i*3+1] -= 0.1; // gravity

              positions[i*3] += sparkVelocities[i*3];
              positions[i*3+1] += sparkVelocities[i*3+1];
              positions[i*3+2] += sparkVelocities[i*3+2];

              // Ground collision
              if (positions[i*3+1] < 0) {
                  positions[i*3+1] = 0;
                  sparkVelocities[i*3+1] *= -0.5; // bounce
              }

              // Building Collision (approximate)
              // Buildings are centered at startOffset + k * CELL_SIZE
              // BLOCK_SIZE is 150. Building width ~130-140. Using 70 as half-width.
              const ix = Math.round((positions[i*3] - startOffset) / CELL_SIZE);
              const iz = Math.round((positions[i*3+2] - startOffset) / CELL_SIZE);
              const cX = startOffset + ix * CELL_SIZE;
              const cZ = startOffset + iz * CELL_SIZE;

              if (Math.abs(positions[i*3] - cX) < 70 && Math.abs(positions[i*3+2] - cZ) < 70) {
                  // Hit building
                  sparkLifetimes[i] = 0;
              }

              sparkLifetimes[i] -= 0.02; // decay
              if (sparkLifetimes[i] < 0) {
                  sparkLifetimes[i] = 0;
                  // Hide below ground
                   positions[i*3+1] = -100;
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

      if (isGameMode.value && droneVelocities) {
         // Game Mode: Physics based movement
         for(let i = 0; i < positions.length / 3; i++) {
             if (deadDrones.has(i)) continue;

             positions[i*3] += droneVelocities[i*3];
             positions[i*3+1] += droneVelocities[i*3+1];
             positions[i*3+2] += droneVelocities[i*3+2];

             // Bounds check (wrap around)
             const range = 2000;
             if (positions[i*3] > range) positions[i*3] = -range;
             if (positions[i*3] < -range) positions[i*3] = range;

             if (positions[i*3+1] > 1000) positions[i*3+1] = 0;
             if (positions[i*3+1] < 0) positions[i*3+1] = 1000;

             if (positions[i*3+2] > range) positions[i*3+2] = -range;
             if (positions[i*3+2] < -range) positions[i*3+2] = range;
         }
      } else if (droneTargetPositions) {
          // Standard Mode: Oscillation around target
          const easing = 0.02;

          for(let i = 0; i < positions.length / 3; i++) {
              if (deadDrones.has(i)) continue;

              const oscTime = Date.now() * 0.001;
              const offset = i;

              const oscX = Math.sin(oscTime + offset) * 20;
              const oscY = Math.cos(oscTime * 0.5 + offset) * 10;
              const oscZ = Math.sin(oscTime * 0.8 + offset) * 20;

              const targetX = droneTargetPositions[i*3] + oscX;
              const targetY = droneTargetPositions[i*3+1] + oscY;
              const targetZ = droneTargetPositions[i*3+2] + oscZ;

              positions[i*3] += (targetX - positions[i*3]) * easing;
              positions[i*3+1] += (targetY - positions[i*3+1]) * easing;
              positions[i*3+2] += (targetZ - positions[i*3+2]) * easing;
          }
      }
      drones.geometry.attributes.position.needsUpdate = true;
  }

  // Camera movement (orbit)
  camera.position.x = Math.sin(time * 0.1) * 800;
  camera.position.z = Math.cos(time * 0.1) * 800;

  const targetLookAt = isGameMode.value ? new Vector3(0, 500, 0) : new Vector3(0, 0, 0);
  currentLookAt.lerp(targetLookAt, 0.02);
  camera.lookAt(currentLookAt);

  renderer.render(scene, camera);
}

let audioCtx: AudioContext | null = null;

function playPewSound() {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    if (!audioCtx) {
        audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.2); // Drop to A2

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
  cancelAnimationFrame(animationId);
  if (renderer) {
    renderer.dispose();
  }
  if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
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
  font-family: 'Courier New', Courier, monospace;
  font-size: 24px;
  font-weight: bold;
  z-index: 10;
  text-shadow: 0 0 10px #00ffcc;
  pointer-events: none;
}

#return-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: #ff00cc;
  border: 1px solid #ff00cc;
  padding: 10px 20px;
  font-family: 'Courier New', Courier, monospace;
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
</style>
