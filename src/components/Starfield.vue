<template>
  <canvas id="outerspace"></canvas>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  let outerspace = document.querySelector("#outerspace") as HTMLCanvasElement;
  let mainContext = outerspace.getContext('2d', { alpha: false }); // alpha: false might help compositing if background is opaque, but here we clear with alpha

  if (!mainContext) {
    return;
  }

  outerspace.width = window.innerWidth;
  outerspace.height = window.innerHeight;

  let canvasWidth = outerspace.width;
  let canvasHeight = outerspace.height;

  let centerX = canvasWidth * 0.5;
  let centerY = canvasHeight * 0.5;

  let numberOfStars = 500;

  let stars: Star[] = [];

  let nebulaCanvas: HTMLCanvasElement;
  let nebulaContext: CanvasRenderingContext2D;

  // Pre-rendered star assets
  let roundStarCanvas: HTMLCanvasElement;
  let spikyStarCanvas: HTMLCanvasElement;
  const STAR_SIZE = 20; // Base size for pre-rendering
  const HALF_STAR_SIZE = STAR_SIZE / 2;

  class Star {
    x: number;
    y: number;
    counter: number;
    radiusMax: number;
    speed: number;
    alpha: number;
    isSpiky: boolean;

    constructor() {
      this.x = getRandomInt(-centerX, centerX);
      this.y = getRandomInt(-centerY, centerY);
      this.counter = getRandomInt(1, canvasWidth);

      this.radiusMax = 1 + Math.random() * 2;
      this.speed = getRandomInt(5, 10);
      this.alpha = 0.8 + Math.random() * 0.2;
      this.isSpiky = Math.random() > 0.5;
    }

    reset() {
        this.counter = canvasWidth;
        this.x = getRandomInt(-centerX, centerX);
        this.y = getRandomInt(-centerY, centerY);
        this.radiusMax = getRandomInt(1, 10);
        this.speed = getRandomInt(1, 5);
    }

    drawStar() {
      this.counter -= this.speed;

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

      const diameter = outerRadius * 2;

      mainContext!.globalAlpha = this.alpha;

      const img = this.isSpiky ? spikyStarCanvas : roundStarCanvas;
      mainContext!.drawImage(img, starX - outerRadius, starY - outerRadius, diameter, diameter);

      mainContext!.globalAlpha = 1.0;
    }
  }

  function preRenderStars() {
    // Round Star
    roundStarCanvas = document.createElement('canvas');
    roundStarCanvas.width = STAR_SIZE;
    roundStarCanvas.height = STAR_SIZE;
    const rCtx = roundStarCanvas.getContext('2d')!;

    const rGradient = rCtx.createRadialGradient(HALF_STAR_SIZE, HALF_STAR_SIZE, 0, HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE);
    rGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    rGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    rCtx.fillStyle = rGradient;
    rCtx.beginPath();
    rCtx.arc(HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE, 0, Math.PI * 2);
    rCtx.fill();

    // Spiky Star
    spikyStarCanvas = document.createElement('canvas');
    spikyStarCanvas.width = STAR_SIZE;
    spikyStarCanvas.height = STAR_SIZE;
    const sCtx = spikyStarCanvas.getContext('2d')!;

    const sGradient = sCtx.createRadialGradient(HALF_STAR_SIZE, HALF_STAR_SIZE, 0, HALF_STAR_SIZE, HALF_STAR_SIZE, HALF_STAR_SIZE);
    sGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    sCtx.fillStyle = sGradient;

    // Draw star shape path to clip or fill
    // Actually, applying gradient to the fill style of the star shape is better

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
  }

  function setup() {
    preRenderStars();

    for (let i = 0; i < numberOfStars; i++) {
      let star = new Star();
      stars.push(star);
    }

    createNebula();
  }
  setup();

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
      mainContext!.fillStyle = "rgba(0, 0, 0, 0.3)";
      mainContext!.fillRect(0, 0, canvasWidth, canvasHeight);

      mainContext!.drawImage(nebulaCanvas, 0, 0);

      mainContext!.translate(centerX, centerY);

      for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        star.drawStar();
      }

      mainContext!.translate(-centerX, -centerY);

      requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function remap(value: number, istart: number, istop: number, ostart: number, ostop: number) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
  }

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
</style>
