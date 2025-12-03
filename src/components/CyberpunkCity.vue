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

const buildings: THREE.Mesh[] = [];
const cars: THREE.Mesh[] = [];

// Configuration
const CITY_SIZE = 2000;
const BLOCK_SIZE = 150;
const ROAD_WIDTH = 40;
const CELL_SIZE = BLOCK_SIZE + ROAD_WIDTH;

const GRID_SIZE = Math.floor(CITY_SIZE / CELL_SIZE);
// We will generate a grid of buildings.
// Grid range: -GRID_SIZE/2 to GRID_SIZE/2

const CAR_COUNT = 150;

onMounted(() => {
  if (!canvasContainer.value) return;

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050510);
  scene.fog = new THREE.FogExp2(0x050510, 0.002);

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );
  camera.position.set(0, 300, 600);
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

  // Create Roads Visuals (Grid)
  const gridHelperSize = GRID_SIZE * CELL_SIZE;
  // We can use planes for roads to make them distinct
  const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

  // Actually, simplest way to make "marked roads" is to draw the roads as black strips on top of ground,
  // or just use the ground as road and place buildings on "islands".
  // Let's place buildings.

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  boxGeo.translate(0, 0.5, 0); // pivot at bottom

  // Generate City Grid
  const startOffset = -(GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2;

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
        // Skip some blocks for variety
        if (Math.random() > 0.8) continue;

        const xPos = startOffset + x * CELL_SIZE;
        const zPos = startOffset + z * CELL_SIZE;

        const h = 20 + Math.random() * 120;
        const w = BLOCK_SIZE - 10 - Math.random() * 20; // slightly smaller than block
        const d = BLOCK_SIZE - 10 - Math.random() * 20;

        const building = new THREE.Mesh(
            boxGeo,
            new THREE.MeshLambertMaterial({ color: 0x111111 })
        );

        building.position.set(xPos, 0, zPos);
        building.scale.set(w, h, d);

        // Neon Edges
        const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: Math.random() > 0.5 ? 0xff00cc : 0x00ccff, transparent: true, opacity: 0.4 })
        );
        line.position.copy(building.position);
        line.position.y = h / 2;

        scene.add(building);
        scene.add(line);
        buildings.push(building);
    }
  }

  // Add Road Markings (Simple Lines)
  // Horizontal Lines (Along X axis)
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });

  for (let i = 0; i <= GRID_SIZE; i++) {
      // These represent the "centers" of the roads running along Z
      // Roads run between blocks.
      // Block centers are at startOffset + x * CELL_SIZE.
      // Road centers are at startOffset + x * CELL_SIZE + CELL_SIZE/2 ? No.

      // Let's visualize:
      // B = Block, R = Road
      // | B | R | B | R | B |

      // Coordinate of Block 0 center: startOffset
      // Coordinate of Block 1 center: startOffset + CELL_SIZE
      // Coordinate of Road between 0 and 1: startOffset + CELL_SIZE/2

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
    // Pick an axis
    const axis = Math.random() > 0.5 ? 'x' : 'z';
    const dir = Math.random() > 0.5 ? 1 : -1;

    // Pick a specific road index
    const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
    const roadCoordinate = startOffset + roadIndex * CELL_SIZE - CELL_SIZE / 2;

    // Add some random offset along the road, and a lane offset
    const laneOffset = (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

    let x = 0, z = 0;

    if (axis === 'x') {
        // Moving along X, so Z is fixed to a road
        z = roadCoordinate + laneOffset;
        x = (Math.random() - 0.5) * CITY_SIZE;
        carGroup.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
    } else {
        // Moving along Z, so X is fixed to a road
        x = roadCoordinate + laneOffset;
        z = (Math.random() - 0.5) * CITY_SIZE;
        carGroup.rotation.y = dir === 1 ? 0 : Math.PI;
    }

    carGroup.position.set(x, 1, z);

    carGroup.userData = {
      speed: 1 + Math.random() * 2,
      dir: dir,
      axis: axis,
      laneOffset: laneOffset // Keep this if we want to change lanes later (not implementing now)
    };

    scene.add(carGroup);
    cars.push(carGroup as unknown as THREE.Mesh);
  }

  // Starfield
  const starGeo = new THREE.BufferGeometry();
  const starCount = 2000;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  const color1 = new THREE.Color(0xff00cc); // Neon pink
  const color2 = new THREE.Color(0x00ccff); // Neon cyan
  const color3 = new THREE.Color(0xffffff); // White

  for (let i = 0; i < starCount; i++) {
    // Spread stars in a dome/box above the city
    const x = (Math.random() - 0.5) * 3000;
    const y = 400 + Math.random() * 1000; // Above the camera roughly
    const z = (Math.random() - 0.5) * 3000;

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
