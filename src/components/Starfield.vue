<template>
  <canvas id="outerspace"></canvas>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  let outerspace = document.querySelector("#outerspace") as HTMLCanvasElement;
  let mainContext = outerspace.getContext('2d');

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

  let frames_per_second = 60;

  let interval = Math.floor(1000 / frames_per_second);
  let startTime = performance.now();
  let previousTime = startTime;

  let currentTime = 0;
  let deltaTime = 0;

  class Star {
    x: number;
    y: number;
    counter: number;
    radiusMax: number;
    speed: number;
    context: CanvasRenderingContext2D;

    constructor() {
      this.x = getRandomInt(-centerX, centerX);
      this.y = getRandomInt(-centerY, centerY);
      this.counter = getRandomInt(1, canvasWidth);

      this.radiusMax = 1 + Math.random() * 2;
      this.speed = getRandomInt(1, 5);

      this.context = mainContext as CanvasRenderingContext2D;
    }

    drawStar() {
      this.counter -= this.speed;

      if (this.counter < 1) {
        this.counter = canvasWidth;
        this.x = getRandomInt(-centerX, centerX);
        this.y = getRandomInt(-centerY, centerY);

        this.radiusMax = getRandomInt(1, 10);
        this.speed = getRandomInt(1, 5);
      }

      let xRatio = this.x / this.counter;
      let yRatio = this.y / this.counter;

      let starX = remap(xRatio, 0, 1, 0, canvasWidth);
      let starY = remap(yRatio, 0, 1, 0, canvasHeight);

      let outerRadius = remap(this.counter, 0, canvasWidth, this.radiusMax, 0);
      let innerRadius = outerRadius / 2;

      let rot = Math.PI / 2 * 3;
      const spikes = 5;
      let step = Math.PI / spikes;

      mainContext!.beginPath();
      mainContext!.moveTo(starX, starY - outerRadius);

      for (let i = 0; i < spikes; i++) {
        let x = starX + Math.cos(rot) * outerRadius;
        let y = starY + Math.sin(rot) * outerRadius;
        mainContext!.lineTo(x, y);
        rot += step;

        x = starX + Math.cos(rot) * innerRadius;
        y = starY + Math.sin(rot) * innerRadius;
        mainContext!.lineTo(x, y);
        rot += step;
      }

      mainContext!.lineTo(starX, starY - outerRadius);
      mainContext!.closePath();

      mainContext!.fillStyle = "#FFF";
      mainContext!.fill();
    }
  }

  function setup() {
    for (let i = 0; i < numberOfStars; i++) {
      let star = new Star();
      stars.push(star);
    }
  }
  setup();

  function draw(timestamp: number) {
    currentTime = timestamp;
    deltaTime = currentTime - previousTime;

    if (deltaTime > interval) {
      previousTime = currentTime - (deltaTime % interval);

      mainContext!.clearRect(0, 0, canvasWidth, canvasHeight);
      mainContext!.fillStyle = "#000";
      mainContext!.fillRect(0, 0, canvasWidth, canvasHeight);

      mainContext!.translate(centerX, centerY);

      for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        star.drawStar();
      }

      mainContext!.translate(-centerX, -centerY);
    }

    requestAnimationFrame(draw);
  }
  draw(0);

  function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function remap(value: number, istart: number, istop: number, ostart: number, ostop: number) {
    // Ensure values are numerical to avoid potential errors
    value = Number(value);
    istart = Number(istart);
    istop = Number(istop);
    ostart = Number(ostart);
    ostop = Number(ostop);

    // Perform the mapping calculation
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
  }

  window.addEventListener('resize', () => {
    outerspace.width = window.innerWidth;
    outerspace.height = window.innerHeight;
    canvasWidth = outerspace.width;
    canvasHeight = outerspace.height;
    centerX = canvasWidth * 0.5;
    centerY = canvasHeight * 0.5;
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
