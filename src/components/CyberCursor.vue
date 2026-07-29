<template>
  <canvas ref="canvasRef" class="cyber-cursor-canvas" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number | null = null;
const particles: Particle[] = [];
const maxParticles = 30;

function addParticle(x: number, y: number) {
  if (particles.length >= maxParticles) {
    particles.shift();
  }
  const color = Math.random() > 0.4 ? 'rgba(0, 255, 204, ' : 'rgba(255, 0, 127, ';
  particles.push({
    x,
    y,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5 - 0.5,
    size: Math.random() * 3 + 1.5,
    alpha: 0.9,
    color,
  });
}

function handleMouseMove(e: MouseEvent) {
  if (Math.random() < 0.6) {
    addParticle(e.clientX, e.clientY);
  }
}

function render() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.035;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `${p.color}${p.alpha})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = p.color.includes('255, 0') ? '#ff007f' : '#00ffcc';
    ctx.fill();
  }

  animationFrameId = requestAnimationFrame(render);
}

function resizeCanvas() {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth;
    canvasRef.value.height = window.innerHeight;
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return;

  const prefersReduced =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!prefersReduced && !isTouch) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId = requestAnimationFrame(render);
  }
});

onUnmounted(() => {
  if (typeof window === 'undefined') return;
  window.removeEventListener('resize', resizeCanvas);
  window.removeEventListener('mousemove', handleMouseMove);
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.cyber-cursor-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}
</style>
