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
const CITY_SIZE = 2000; // Size of the city grid
const BUILDING_COUNT = 300;
const CAR_COUNT = 100;

onMounted(() => {
  if (!canvasContainer.value) return;

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050510);
  scene.fog = new THREE.FogExp2(0x050510, 0.0025);

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );
  camera.position.set(0, 150, 400);
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

  // Grid / Ground
  const gridHelper = new THREE.GridHelper(CITY_SIZE, 40, 0xff00cc, 0x222222);
  scene.add(gridHelper);

  const planeGeometry = new THREE.PlaneGeometry(CITY_SIZE, CITY_SIZE);
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.5;
  scene.add(plane);

  // Buildings
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  boxGeo.translate(0, 0.5, 0); // pivot at bottom

  for (let i = 0; i < BUILDING_COUNT; i++) {
    const h = 20 + Math.random() * 100;
    const w = 10 + Math.random() * 30;
    const d = 10 + Math.random() * 30;

    const building = new THREE.Mesh(
      boxGeo,
      new THREE.MeshLambertMaterial({ color: 0x111111 })
    );

    building.position.x = (Math.random() - 0.5) * CITY_SIZE;
    building.position.z = (Math.random() - 0.5) * CITY_SIZE;
    building.scale.set(w, h, d);

    // Simple window texture effect or edges
    // For performance, we can add edges
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: Math.random() > 0.5 ? 0xff00cc : 0x00ccff, transparent: true, opacity: 0.3 })
    );
    // Align edges with building
    line.position.copy(building.position);
    line.position.y = h / 2;

    scene.add(building);
    scene.add(line);
    buildings.push(building);
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
      const underglowColor = Math.random() > 0.5 ? 0xff00cc : 0x00ccff; // Pink or Cyan
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


    const x = (Math.random() - 0.5) * CITY_SIZE;
    const z = (Math.random() - 0.5) * CITY_SIZE;

    carGroup.position.set(x, 1, z);

    // Store extra data in user data
    carGroup.userData = {
      speed: 1 + Math.random() * 2,
      dir: Math.random() > 0.5 ? 1 : -1,
      axis: Math.random() > 0.5 ? 'x' : 'z'
    };

    if (carGroup.userData.axis === 'x') {
      carGroup.rotation.y = carGroup.userData.dir === 1 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      carGroup.rotation.y = carGroup.userData.dir === 1 ? 0 : Math.PI;
    }

    scene.add(carGroup);
    cars.push(carGroup as unknown as THREE.Mesh); // Type assertion for array compatibility
  }

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

  // Move cars
  cars.forEach(car => {
    if (car.userData.axis === 'x') {
      car.position.x += car.userData.speed * car.userData.dir;
      if (car.position.x > CITY_SIZE / 2) car.position.x = -CITY_SIZE / 2;
      if (car.position.x < -CITY_SIZE / 2) car.position.x = CITY_SIZE / 2;
    } else {
      car.position.z += car.userData.speed * car.userData.dir;
      if (car.position.z > CITY_SIZE / 2) car.position.z = -CITY_SIZE / 2;
      if (car.position.z < -CITY_SIZE / 2) car.position.z = CITY_SIZE / 2;
    }
  });

  // Camera movement (orbit)
  camera.position.x = Math.sin(time * 0.1) * 600;
  camera.position.z = Math.cos(time * 0.1) * 600;
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
