<template>
  <div ref="mazeContainer" class="maze-container"></div>
  <div class="controls">
    <button @touchstart="move('forward')" @touchend="stop('forward')" @mousedown="move('forward')" @mouseup="stop('forward')">Up</button>
    <button @touchstart="move('backward')" @touchend="stop('backward')" @mousedown="move('backward')" @mouseup="stop('backward')">Down</button>
    <button @touchstart="move('left')" @touchend="stop('left')" @mousedown="move('left')" @mouseup="stop('left')">Left</button>
    <button @touchstart="move('right')" @touchend="stop('right')" @mousedown="move('right')" @mouseup="stop('right')">Right</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

/**
 * @file Maze.vue
 * @description A component that renders a 3D maze game using three.js.
 */

const mazeContainer = ref<HTMLDivElement | null>(null);
let moveState = { forward: false, backward: false, left: false, right: false };

const move = (direction: 'forward' | 'backward' | 'left' | 'right') => {
  moveState[direction] = true;
};

const stop = (direction: 'forward' | 'backward' | 'left' | 'right') => {
  moveState[direction] = false;
};

onMounted(() => {
  if (mazeContainer.value) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mazeContainer.value.appendChild(renderer.domElement);

    // Maze generation using Recursive Backtracker
    const mazeSize = 10;
    const wallSize = 5;
    const walls: THREE.Mesh[] = [];
    const maze = Array(mazeSize).fill(0).map(() => Array(mazeSize).fill(0).map(() => ({ n: false, s: false, e: false, w: false, visited: false })));

    const stack: { x: number, y: number }[] = [];
    let current = { x: 0, y: 0 };
    maze[current.x][current.y].visited = true;

    do {
      const neighbors = [];
      const { x, y } = current;
      if (y > 0 && !maze[x][y - 1].visited) neighbors.push({ x, y: y - 1, dir: 'n' });
      if (y < mazeSize - 1 && !maze[x][y + 1].visited) neighbors.push({ x, y: y + 1, dir: 's' });
      if (x < mazeSize - 1 && !maze[x + 1][y].visited) neighbors.push({ x: x + 1, y, dir: 'e' });
      if (x > 0 && !maze[x - 1][y].visited) neighbors.push({ x: x - 1, y, dir: 'w' });

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        if (next.dir === 'n') { maze[x][y].n = true; maze[next.x][next.y].s = true; }
        if (next.dir === 's') { maze[x][y].s = true; maze[next.x][next.y].n = true; }
        if (next.dir === 'e') { maze[x][y].e = true; maze[next.x][next.y].w = true; }
        if (next.dir === 'w') { maze[x][y].w = true; maze[next.x][next.y].e = true; }
        stack.push(current);
        current = { x: next.x, y: next.y };
        maze[current.x][current.y].visited = true;
      } else if (stack.length > 0) {
        current = stack.pop()!;
      }
    } while (stack.length > 0);

    const wallGeometry = new THREE.BoxGeometry(wallSize, wallSize, wallSize);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });

    for (let i = 0; i < mazeSize; i++) {
      for (let j = 0; j < mazeSize; j++) {
        if (!maze[i][j].n) {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          wall.position.set(i * wallSize, wallSize / 2, j * wallSize - wallSize / 2);
          walls.push(wall);
          scene.add(wall);
        }
        if (!maze[i][j].s) {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          wall.position.set(i * wallSize, wallSize / 2, j * wallSize + wallSize / 2);
          walls.push(wall);
          scene.add(wall);
        }
        if (!maze[i][j].e) {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          wall.position.set(i * wallSize + wallSize / 2, wallSize / 2, j * wallSize);
          walls.push(wall);
          scene.add(wall);
        }
        if (!maze[i][j].w) {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          wall.position.set(i * wallSize - wallSize / 2, wallSize / 2, j * wallSize);
          walls.push(wall);
          scene.add(wall);
        }
      }
    }

    const goalGeometry = new THREE.BoxGeometry(wallSize / 2, wallSize / 2, wallSize / 2);
    const goalMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const goal = new THREE.Mesh(goalGeometry, goalMaterial);
    goal.position.set((mazeSize - 1) * wallSize, wallSize / 4, (mazeSize - 1) * wallSize);
    scene.add(goal);

    camera.position.set(0, wallSize * 0.5, 0);
    const raycaster = new THREE.Raycaster();

    const animate = () => {
      requestAnimationFrame(animate);
      const moveSpeed = 0.1;
      const rotateSpeed = 0.05;

      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);

      if (moveState.forward) {
        raycaster.set(camera.position, direction);
        const intersects = raycaster.intersectObjects(walls);
        if (intersects.length === 0 || intersects[0].distance > 1) {
          camera.translateZ(-moveSpeed);
        }
      }
      if (moveState.backward) {
        raycaster.set(camera.position, direction.negate());
        const intersects = raycaster.intersectObjects(walls);
        if (intersects.length === 0 || intersects[0].distance > 1) {
          camera.translateZ(moveSpeed);
        }
      }
      if (moveState.left) camera.rotateY(rotateSpeed);
      if (moveState.right) camera.rotateY(-rotateSpeed);

      if (camera.position.distanceTo(goal.position) < wallSize / 4) {
        alert("You win!");
        camera.position.set(0, wallSize * 0.5, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });
  }
});
</script>

<style scoped>
.maze-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}
</style>
