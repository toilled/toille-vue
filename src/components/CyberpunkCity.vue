<template>
  <div ref="canvasContainer" id="cyberpunk-city"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import * as THREE from "three";

const canvasContainer = ref<HTMLDivElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let animationId: number;

const buildings: THREE.Object3D[] = [];
// Fix: cars are Group objects
const cars: THREE.Group[] = [];

// Configuration
const CITY_SIZE = 2000;
const BLOCK_SIZE = 150;
const ROAD_WIDTH = 40;
const CELL_SIZE = BLOCK_SIZE + ROAD_WIDTH;

const GRID_SIZE = Math.floor(CITY_SIZE / CELL_SIZE);
// We will generate a grid of buildings.
// Grid range: -GRID_SIZE/2 to GRID_SIZE/2

const CAR_COUNT = 150;

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
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    return texture;
}

// Generate Billboard Textures
function createBillboardTextures() {
    const textures: THREE.CanvasTexture[] = [];
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
        const texture = new THREE.CanvasTexture(canvas);
        textures.push(texture);
    }
    return textures;
}

onMounted(() => {
  if (!canvasContainer.value) return;

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050510);
  scene.fog = new THREE.FogExp2(0x050510, 0.001); // Reduced fog density

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );
  camera.position.set(0, 250, 600); // Lowered camera slightly
  camera.lookAt(0, 0, 0);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasContainer.value.appendChild(renderer.domElement);

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
  const planeGeometry = new THREE.PlaneGeometry(CITY_SIZE * 2, CITY_SIZE * 2);
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0a15 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.5;
  scene.add(plane);

  // Generate City Grid
  const startOffset = -(GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2;
  const windowTexture = createWindowTexture();
  const billboardTextures = createBillboardTextures();

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  boxGeo.translate(0, 0.5, 0); // pivot at bottom

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
        // Skip some blocks for variety
        if (Math.random() > 0.8) continue;

        const xPos = startOffset + x * CELL_SIZE;
        const zPos = startOffset + z * CELL_SIZE;

        const h = 40 + Math.random() * 120; // Slightly taller minimum
        const w = BLOCK_SIZE - 10 - Math.random() * 20;
        const d = BLOCK_SIZE - 10 - Math.random() * 20;

        const buildingGroup = new THREE.Group();
        buildingGroup.position.set(xPos, 0, zPos);

        // Main Block
        const material = new THREE.MeshLambertMaterial({
            color: 0x222222,
            map: windowTexture
        });
        const mainBlock = new THREE.Mesh(boxGeo, material);
        mainBlock.scale.set(w, h, d);
        buildingGroup.add(mainBlock);

        // Edges for Main Block
        const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: Math.random() > 0.5 ? 0xff00cc : 0x00ccff, transparent: true, opacity: 0.4 })
        );
        line.position.y = h / 2; // EdgesGeometry is centered
        buildingGroup.add(line);

        // Top Structure (for taller buildings)
        if (h > 100 && Math.random() > 0.4) {
            const h2 = h * 0.3;
            const w2 = w * 0.6;
            const d2 = d * 0.6;

            const topBlock = new THREE.Mesh(boxGeo, material);
            topBlock.scale.set(w2, h2, d2);
            topBlock.position.y = h;
            buildingGroup.add(topBlock);

            const topEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w2, h2, d2));
            const topLine = new THREE.LineSegments(
                topEdges,
                new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
            );
            topLine.position.y = h + h2 / 2;
            buildingGroup.add(topLine);

            // Antenna
            if (Math.random() > 0.5) {
                const antennaH = h * 0.2;
                const antenna = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
                antenna.scale.set(2, antennaH, 2);
                antenna.position.y = h + h2;
                buildingGroup.add(antenna);
            }
        }

        // Billboards
        if (h > 60 && Math.random() > 0.7) {
            const texIndex = Math.floor(Math.random() * billboardTextures.length);
            const bbTex = billboardTextures[texIndex];

            const bbW = 20 + Math.random() * 15;
            const bbH = 10 + Math.random() * 10;
            const bbGeo = new THREE.PlaneGeometry(bbW, bbH);
            const bbMat = new THREE.MeshBasicMaterial({
                map: bbTex,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            const billboard = new THREE.Mesh(bbGeo, bbMat);

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
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });

  for (let i = 0; i <= GRID_SIZE; i++) {
      const pos = startOffset + i * CELL_SIZE - CELL_SIZE / 2;

      // Road line geometry (Along Z)
      const points = [];
      points.push(new THREE.Vector3(pos, 0.1, -CITY_SIZE));
      points.push(new THREE.Vector3(pos, 0.1, CITY_SIZE));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      scene.add(line);

      // Road line geometry (Along X)
      const points2 = [];
      points2.push(new THREE.Vector3(-CITY_SIZE, 0.1, pos));
      points2.push(new THREE.Vector3(CITY_SIZE, 0.1, pos));
      const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);
      const line2 = new THREE.Line(geometry2, lineMaterial);
      scene.add(line2);
  }


  // Cars
  const carGeo = new THREE.BoxGeometry(4, 2, 8);
  const tailLightGeo = new THREE.BoxGeometry(0.5, 0.5, 0.1);
  const headLightGeo = new THREE.BoxGeometry(0.5, 0.5, 0.1);

  for (let i = 0; i < CAR_COUNT; i++) {
    const isSpecial = Math.random() > 0.8;
    const bodyColor = isSpecial ? 0x222222 : (Math.random() > 0.5 ? 0x050505 : 0x111111);

    // Car Group
    const carGroup = new THREE.Group();

    // Car Body
    const carBody = new THREE.Mesh(
      carGeo,
      new THREE.MeshLambertMaterial({ color: bodyColor })
    );
    carGroup.add(carBody);

    // Underglow (Neon)
    if (Math.random() > 0.3) {
      const underglowGeo = new THREE.PlaneGeometry(5, 9);
      const underglowColor = Math.random() > 0.5 ? 0xff00cc : 0x00ccff;
      const underglow = new THREE.Mesh(
        underglowGeo,
        new THREE.MeshBasicMaterial({ color: underglowColor, opacity: 0.5, transparent: true, side: THREE.DoubleSide })
      );
      underglow.rotation.x = Math.PI / 2;
      underglow.position.y = -0.9;
      carGroup.add(underglow);
    }

    // Tail lights
    const tl1 = new THREE.Mesh(tailLightGeo, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    tl1.position.set(1.5, 0, 4);
    carGroup.add(tl1);

    const tl2 = new THREE.Mesh(tailLightGeo, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    tl2.position.set(-1.5, 0, 4);
    carGroup.add(tl2);

    // Head lights
    const hl1 = new THREE.Mesh(headLightGeo, new THREE.MeshBasicMaterial({ color: 0xffffaa }));
    hl1.position.set(1.5, 0, -4);
    carGroup.add(hl1);

    const hl2 = new THREE.Mesh(headLightGeo, new THREE.MeshBasicMaterial({ color: 0xffffaa }));
    hl2.position.set(-1.5, 0, -4);
    carGroup.add(hl2);

    // Position on Road
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

    carGroup.userData = {
      speed: 1 + Math.random() * 2,
      dir: dir,
      axis: axis,
      laneOffset: laneOffset
    };

    scene.add(carGroup);
    cars.push(carGroup);
  }

  // Starfield
  const starGeo = new THREE.BufferGeometry();
  const starCount = 2000;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  const color1 = new THREE.Color(0xff00cc);
  const color2 = new THREE.Color(0x00ccff);
  const color3 = new THREE.Color(0xffffff);

  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 4000;
    const y = 200 + Math.random() * 800;
    const z = (Math.random() - 0.5) * 4000;

    starPositions[i * 3] = x;
    starPositions[i * 3 + 1] = y;
    starPositions[i * 3 + 2] = z;

    const c = Math.random();
    let finalColor = color3;
    if (c < 0.33) finalColor = color1;
    else if (c < 0.66) finalColor = color2;

    starColors[i * 3] = finalColor.r;
    starColors[i * 3 + 1] = finalColor.g;
    starColors[i * 3 + 2] = finalColor.b;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMaterial = new THREE.PointsMaterial({
    size: 2.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });

  const stars = new THREE.Points(starGeo, starMaterial);
  scene.add(stars);

  window.addEventListener("resize", onResize);
  animate();
});

function onResize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  animationId = requestAnimationFrame(animate);

  const time = Date.now() * 0.0005;
  const bound = (GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE;

  // Move cars
  cars.forEach(car => {
    if (car.userData.axis === 'x') {
      car.position.x += car.userData.speed * car.userData.dir;
      if (car.position.x > bound) car.position.x = -bound;
      if (car.position.x < -bound) car.position.x = bound;
    } else {
      car.position.z += car.userData.speed * car.userData.dir;
      if (car.position.z > bound) car.position.z = -bound;
      if (car.position.z < -bound) car.position.z = bound;
    }
  });

  // Camera movement (orbit)
  camera.position.x = Math.sin(time * 0.1) * 800;
  camera.position.z = Math.cos(time * 0.1) * 800;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  cancelAnimationFrame(animationId);
  if (renderer) {
    renderer.dispose();
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
