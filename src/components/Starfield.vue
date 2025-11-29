<template>
  <canvas id="outerspace" @click="handleClick"></canvas>
  <div class="score-counter" v-if="score > 0">Score: {{ score }}</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const score = ref(0);
const warpFactor = ref(1);
let warpAnimationId: number | null = null;

let outerspace: HTMLCanvasElement;
let mainContext: CanvasRenderingContext2D | null;

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

let centerX = canvasWidth * 0.5;
let centerY = canvasHeight * 0.5;

let numberOfStars = 500;

// Pre-rendered star assets
let starAssets: Record<string, { round: HTMLCanvasElement, spiky: HTMLCanvasElement }> = {};
const STAR_SIZE = 20;
const HALF_STAR_SIZE = STAR_SIZE / 2;

const STAR_COLORS = [
  { name: 'white', stops: ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)'] },
  { name: 'blue', stops: ['rgba(170, 191, 255, 1)', 'rgba(170, 191, 255, 0)'] },
  { name: 'red', stops: ['rgba(255, 204, 170, 1)', 'rgba(255, 204, 170, 0)'] },
  { name: 'yellow', stops: ['rgba(255, 255, 170, 1)', 'rgba(255, 255, 170, 0)'] },
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function remap(value: number, istart: number, istop: number, ostart: number, ostop: number) {
  return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

function triggerWarp() {
  if (warpAnimationId !== null) {
    cancelAnimationFrame(warpAnimationId);
  }

  const start = performance.now();
  // Reduce speed for mobile devices (screens smaller than 768px)
  const isMobile = window.innerWidth < 768;
  const targetSpeed = isMobile ? 25 : 50;

  function animateWarp(time: number) {
    const elapsed = time - start;

    if (elapsed < 1000) {
        // Ramp up over 1 second
        warpFactor.value = 1 + (targetSpeed - 1) * (elapsed / 1000);
        warpAnimationId = requestAnimationFrame(animateWarp);
    } else if (elapsed < 3000) {
        // Ramp down over 2 seconds
        const progress = (elapsed - 1000) / 2000;
        warpFactor.value = targetSpeed - (targetSpeed - 1) * progress;
        warpAnimationId = requestAnimationFrame(animateWarp);
    } else {
        warpFactor.value = 1;
        warpAnimationId = null;
    }
  }

  warpAnimationId = requestAnimationFrame(animateWarp);
}

defineExpose({ triggerWarp });

class Star {
  x: number;
  y: number;
  counter: number;
  radiusMax: number;
  speed: number;
  alpha: number;
  isSpiky: boolean;
  colorName: string;
  twinkleOffset: number;
  
  // Track current render properties for click detection
  currentX: number = 0;
  currentY: number = 0;
  currentRadius: number = 0;

  constructor() {
    this.x = getRandomInt(-centerX, centerX);
    this.y = getRandomInt(-centerY, centerY);
    this.counter = getRandomInt(1, canvasWidth);

    this.radiusMax = 1 + Math.random() * 2;
    this.speed = getRandomInt(5, 10);
    this.alpha = 0.7 + Math.random() * 0.3;
    this.isSpiky = Math.random() > 0.5;
    this.colorName = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)].name;
    this.twinkleOffset = Math.random() * Math.PI * 2;
  }

  reset() {
      this.counter = canvasWidth;
      this.x = getRandomInt(-centerX, centerX);
      this.y = getRandomInt(-centerY, centerY);
      this.radiusMax = getRandomInt(1, 10);
      this.speed = getRandomInt(1, 5);
      this.colorName = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)].name;
      this.isSpiky = Math.random() > 0.5;
  }

  drawStar() {
    this.counter -= this.speed * warpFactor.value;

    if (this.counter < 1) {
      this.reset();
    }

    let xRatio = this.x / this.counter;
    let yRatio = this.y / this.counter;

    let starX = remap(xRatio, 0, 1, 0, canvasWidth);
    let starY = remap(yRatio, 0, 1, 0, canvasHeight);

    let outerRadius = remap(this.counter, 0, canvasWidth, this.radiusMax, 0);

    // Don't draw if too small
    if (outerRadius <= 0) return;

    // Update current properties for click detection
    this.currentX = starX;
    this.currentY = starY;
    this.currentRadius = outerRadius;

    const diameter = outerRadius * 2;

    // Twinkling
    const twinkle = Math.sin(Date.now() * 0.003 + this.twinkleOffset) * 0.15;
    let currentAlpha = this.alpha + twinkle;
    if (currentAlpha < 0.2) currentAlpha = 0.2;
    if (currentAlpha > 1) currentAlpha = 1;

    if (mainContext) {
      mainContext.globalAlpha = currentAlpha;

      const img = this.isSpiky ? starAssets[this.colorName].spiky : starAssets[this.colorName].round;
      mainContext.drawImage(img, starX - outerRadius, starY - outerRadius, diameter, diameter);

      mainContext.globalAlpha = 1.0;
    }
  }
}

let stars: Star[] = [];
let shootingStar: ShootingStar;

let nebulaCanvas: HTMLCanvasElement;
let nebulaContext: CanvasRenderingContext2D;

const handleClick = (event: MouseEvent) => {
  const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  // Iterate backwards to check top-most stars first
  for (let i = stars.length - 1; i >= 0; i--) {
    const star = stars[i];
    // Adjust click coordinates to account for canvas translation in draw loop
    const translatedClickX = clickX - centerX;
    const translatedClickY = clickY - centerY;

    const dx = translatedClickX - star.currentX;
    const dy = translatedClickY - star.currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Add some padding to make it easier to click small stars
    const hitRadius = Math.max(star.currentRadius, 5); 

    if (distance <= hitRadius) {
      score.value++;
      break;
    }
  }
};

class ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  opacity: number;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.active = false;
    this.opacity = 0;
  }

  trigger() {
      if (this.active) return;
      this.active = true;
      this.opacity = 1;

      this.x = Math.random() * canvasWidth;
      this.y = Math.random() * canvasHeight;

      const angle = Math.random() * Math.PI * 2;
      const speed = 15 + Math.random() * 10;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
  }

  draw() {
      if (!this.active) {
          if (Math.random() < 0.005) {
              this.trigger();
          }
          return;
      }

      this.x += this.vx;
      this.y += this.vy;
      this.opacity -= 0.015;

      if (this.opacity <= 0) {
          this.active = false;
          return;
      }

      if (mainContext) {
          mainContext.beginPath();
          const gradient = mainContext.createLinearGradient(this.x, this.y, this.x - this.vx * 3, this.y - this.vy * 3);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
          gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

          mainContext.lineWidth = 2;
          mainContext.strokeStyle = gradient;
          mainContext.moveTo(this.x, this.y);
          mainContext.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
          mainContext.stroke();
      }
  }
}

function preRenderStars() {
  STAR_COLORS.forEach(color => {
      // Round Star
      const roundStarCanvas = document.createElement('canvas');
      roundStarCanvas.width = STAR_SIZE;
      roundStarCanvas.height = STAR_SIZE;
      const rCtx = roundStarCanvas.getContext('2d')!;

      const rGradient = rCtx.createRadialGradient(HALF_STAR_SIZE, HALF_STAR_SIZE, 0, HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE);
      rGradient.addColorStop(0, color.stops[0]);
      rGradient.addColorStop(1, color.stops[1]);

      rCtx.fillStyle = rGradient;
      rCtx.beginPath();
      rCtx.arc(HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE, 0, Math.PI * 2);
      rCtx.fill();

      // Spiky Star
      const spikyStarCanvas = document.createElement('canvas');
      spikyStarCanvas.width = STAR_SIZE;
      spikyStarCanvas.height = STAR_SIZE;
      const sCtx = spikyStarCanvas.getContext('2d')!;

      const sGradient = sCtx.createRadialGradient(HALF_STAR_SIZE, HALF_STAR_SIZE, 0, HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE);
      sGradient.addColorStop(0, color.stops[0]);
      sGradient.addColorStop(1, color.stops[1]);

      sCtx.fillStyle = sGradient;

      let innerRadius = HALF_STAR_SIZE / 2;
      let outerRadius = HALF_STAR_SIZE;
      let rot = Math.PI / 2 * 3;
      const spikes = 5;
      let step = Math.PI / spikes;

      sCtx.beginPath();
      sCtx.moveTo(HALF_STAR_SIZE, HALF_STAR_SIZE - outerRadius);

      for (let i = 0; i < spikes; i++) {
          let x = HALF_STAR_SIZE + Math.cos(rot) * outerRadius;
          let y = HALF_STAR_SIZE + Math.sin(rot) * outerRadius;
          sCtx.lineTo(x, y);
          rot += step;

          x = HALF_STAR_SIZE + Math.cos(rot) * innerRadius;
          y = HALF_STAR_SIZE + Math.sin(rot) * innerRadius;
          sCtx.lineTo(x, y);
          rot += step;
      }
      sCtx.lineTo(HALF_STAR_SIZE, HALF_STAR_SIZE - outerRadius);
      sCtx.closePath();
      sCtx.fill();

      starAssets[color.name] = { round: roundStarCanvas, spiky: spikyStarCanvas };
  });
}

function createNebula() {
  nebulaCanvas = document.createElement('canvas');
  nebulaCanvas.width = canvasWidth;
  nebulaCanvas.height = canvasHeight;
  nebulaContext = nebulaCanvas.getContext('2d')!;

  // First nebula (centered)
  const gradient = nebulaContext.createRadialGradient(
    canvasWidth * 0.5,
    canvasHeight * 0.5,
    0,
    canvasWidth * 0.5,
    canvasHeight * 0.5,
    canvasWidth * 0.6
  );
  gradient.addColorStop(0, 'rgba(100, 50, 150, 0.4)');
  gradient.addColorStop(0.5, 'rgba(50, 20, 100, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  nebulaContext.fillStyle = gradient;
  nebulaContext.beginPath();
  nebulaContext.arc(canvasWidth * 0.5, canvasHeight * 0.5, canvasWidth * 0.6, 0, Math.PI * 2);
  nebulaContext.fill();

  // Second nebula (top-left)
  const secondGradient = nebulaContext.createRadialGradient(
    canvasWidth * 0.3,
    canvasHeight * 0.3,
    0,
    canvasWidth * 0.3,
    canvasHeight * 0.3,
    canvasWidth * 0.3
  );
  secondGradient.addColorStop(0, 'rgba(255, 100, 200, 0.3)');
  secondGradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.1)');
  secondGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  nebulaContext.fillStyle = secondGradient;
  nebulaContext.beginPath();
  nebulaContext.arc(canvasWidth * 0.3, canvasHeight * 0.3, canvasWidth * 0.3, 0, Math.PI * 2);
  nebulaContext.fill();
}

function draw() {
    if (!mainContext) return;

    // Background clear
    mainContext.fillStyle = "rgba(0, 0, 0, 0.3)";
    mainContext.fillRect(0, 0, canvasWidth, canvasHeight);

    // Nebula
    mainContext.drawImage(nebulaCanvas, 0, 0);

    // Stars
    mainContext.translate(centerX, centerY);

    for (let i = 0; i < stars.length; i++) {
      let star = stars[i];
      star.drawStar();
    }

    mainContext.translate(-centerX, -centerY);

    // Shooting star
    shootingStar.draw();

    requestAnimationFrame(draw);
}

onMounted(() => {
  outerspace = document.querySelector("#outerspace") as HTMLCanvasElement;
  mainContext = outerspace.getContext('2d', { alpha: false });

  if (!mainContext) {
    return;
  }

  outerspace.width = window.innerWidth;
  outerspace.height = window.innerHeight;

  canvasWidth = outerspace.width;
  canvasHeight = outerspace.height;

  centerX = canvasWidth * 0.5;
  centerY = canvasHeight * 0.5;

  preRenderStars();

  for (let i = 0; i < numberOfStars; i++) {
    let star = new Star();
    stars.push(star);
  }

  shootingStar = new ShootingStar();

  createNebula();

  requestAnimationFrame(draw);

  window.addEventListener('resize', () => {
    outerspace.width = window.innerWidth;
    outerspace.height = window.innerHeight;
    canvasWidth = outerspace.width;
    canvasHeight = outerspace.height;
    centerX = canvasWidth * 0.5;
    centerY = canvasHeight * 0.5;

    createNebula();
  });
});
</script>

<style scoped>
#outerspace {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.score-counter {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-family: sans-serif;
  font-size: 24px;
  pointer-events: none;
  z-index: 10;
}
</style>
