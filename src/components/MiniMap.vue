<template>
  <div v-if="visible" id="minimap-container">
    <canvas ref="canvasRef" id="minimap-canvas" width="180" height="180"></canvas>
    <div id="minimap-label">CITY GRID</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { BOUNDS, CELL_SIZE, START_OFFSET, GRID_SIZE } from "../game/config";

const props = defineProps({
  playerX: { type: Number, default: 0 },
  playerZ: { type: Number, default: 0 },
  playerRotation: { type: Number, default: 0 },
  objectives: {
    type: Array as () => { x: number; z: number; completed: boolean; label: string; type: string }[],
    default: () => [],
  },
  visible: { type: Boolean, default: false },
  currentMissionId: { type: String, default: "" },
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const mapSize = 180;
const worldSize = BOUNDS * 2;
const scale = mapSize / worldSize;

function draw() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, mapSize, mapSize);

  const cx = mapSize / 2;
  const cy = mapSize / 2;

  ctx.save();
  ctx.translate(cx, cy);

  // Draw city grid background
  const gridScale = scale;
  const halfGrid = (GRID_SIZE * CELL_SIZE) / 2;

  // Dark background
  ctx.fillStyle = "rgba(5, 5, 20, 0.85)";
  ctx.fillRect(-cx, -cy, mapSize, mapSize);

  // Grid lines
  ctx.strokeStyle = "rgba(0, 255, 204, 0.08)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= GRID_SIZE; i++) {
    const pos = (i * CELL_SIZE - halfGrid) * gridScale;
    ctx.beginPath();
    ctx.moveTo(pos, -halfGrid * gridScale);
    ctx.lineTo(pos, halfGrid * gridScale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-halfGrid * gridScale, pos);
    ctx.lineTo(halfGrid * gridScale, pos);
    ctx.stroke();
  }

  // Draw roads (streets between blocks)
  const roadWidth = 40;
  ctx.fillStyle = "rgba(0, 255, 204, 0.06)";
  for (let i = 0; i <= GRID_SIZE; i++) {
    const pos = (i * CELL_SIZE - halfGrid) * gridScale;
    const rw = roadWidth * gridScale;
    ctx.fillRect(pos - rw / 2, -halfGrid * gridScale, rw, halfGrid * 2 * gridScale);
    ctx.fillRect(-halfGrid * gridScale, pos - rw / 2, halfGrid * 2 * gridScale, rw);
  }

  // Draw buildings
  const blockSize = 150;
  ctx.fillStyle = "rgba(0, 150, 255, 0.15)";
  ctx.strokeStyle = "rgba(0, 150, 255, 0.08)";
  ctx.lineWidth = 0.5;
  for (let gx = 0; gx < GRID_SIZE; gx++) {
    for (let gz = 0; gz < GRID_SIZE; gz++) {
      const wx = START_OFFSET + gx * CELL_SIZE;
      const wz = START_OFFSET + gz * CELL_SIZE;
      const sx = (wx - 0) * gridScale;
      const sy = (wz - 0) * gridScale;
      const bs = blockSize * gridScale;
      ctx.fillRect(sx - bs / 2, sy - bs / 2, bs, bs);
      ctx.strokeRect(sx - bs / 2, sy - bs / 2, bs, bs);
    }
  }

  // Draw objectives
  for (const obj of props.objectives) {
    if (obj.completed) continue;
    const ox = (obj.x - 0) * gridScale;
    const oz = (obj.z - 0) * gridScale;

    if (obj.type === "collect") {
      ctx.fillStyle = "#ffcc00";
      ctx.shadowColor = "#ffcc00";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(ox, oz, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (obj.type === "interact") {
      ctx.fillStyle = "#ff00cc";
      ctx.shadowColor = "#ff00cc";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(ox, oz, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#00ffcc";
      ctx.shadowColor = "#00ffcc";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(ox, oz, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // Draw player position (triangle showing direction)
  const px = (props.playerX - 0) * gridScale;
  const pz = (props.playerZ - 0) * gridScale;
  const rot = props.playerRotation;

  ctx.save();
  ctx.translate(px, pz);
  ctx.rotate(-rot);

  // Player glow
  ctx.shadowColor = "#00ffcc";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#00ffcc";
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(-4, 6);
  ctx.lineTo(4, 6);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();

  // Border ring
  ctx.strokeStyle = "rgba(0, 255, 204, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-cx, -cy, mapSize, mapSize);

  ctx.restore();
}

let animFrame: number;
function renderLoop() {
  draw();
  animFrame = requestAnimationFrame(renderLoop);
}

watch(() => [props.playerX, props.playerZ, props.playerRotation, props.objectives, props.visible], () => {
  if (props.visible) {
    draw();
  }
}, { deep: true });

onMounted(() => {
  if (props.visible) {
    renderLoop();
  }
});

onBeforeUnmount(() => {
  if (animFrame) cancelAnimationFrame(animFrame);
});
</script>

<style scoped>
#minimap-container {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 15;
  border: 1px solid rgba(0, 255, 204, 0.3);
  box-shadow: 0 0 20px rgba(0, 255, 204, 0.15), inset 0 0 20px rgba(0, 0, 0, 0.5);
  background: rgba(5, 5, 20, 0.85);
  pointer-events: none;
}

#minimap-canvas {
  display: block;
  width: 180px;
  height: 180px;
  image-rendering: pixelated;
}

#minimap-label {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-family: "Courier New", Courier, monospace;
  font-size: 8px;
  font-weight: bold;
  color: rgba(0, 255, 204, 0.5);
  letter-spacing: 2px;
  text-shadow: 0 0 4px rgba(0, 255, 204, 0.3);
}
</style>
