<template>
  <canvas id="outerspace"></canvas>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Star } from "./lib/Star";
import { Spaceship } from "./lib/Spaceship";

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
  let numberOfSpaceships = 10;

  let stars: Star[] = [];
  let spaceships: Spaceship[] = [];

  let frames_per_second = 60;

  let interval = Math.floor(1000 / frames_per_second);
  let startTime = performance.now();
  let previousTime = startTime;

  let currentTime = 0;
  let deltaTime = 0;

  let nebulaCanvas: HTMLCanvasElement;
  let nebulaContext: CanvasRenderingContext2D;

  function setup() {
    for (let i = 0; i < numberOfStars; i++) {
      let star = new Star(mainContext!, canvasWidth, canvasHeight, centerX, centerY, getRandomInt, remap);
      stars.push(star);
    }

    for (let i = 0; i < numberOfSpaceships; i++) {
      let spaceship = new Spaceship(mainContext!, canvasWidth, canvasHeight, centerX, centerY, getRandomInt, remap);
      spaceships.push(spaceship);
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
      canvasWidth * 0.3, // Corrected position based on review feedback
      canvasHeight * 0.3, // Corrected position based on review feedback
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

  function draw(timestamp: number) {
    currentTime = timestamp;
    deltaTime = currentTime - previousTime;

    if (deltaTime > interval) {
      previousTime = currentTime - (deltaTime % interval);

      mainContext!.fillStyle = "rgba(0, 0, 0, 0.3)";
      mainContext!.fillRect(0, 0, canvasWidth, canvasHeight);

      mainContext!.drawImage(nebulaCanvas, 0, 0);

      mainContext!.translate(centerX, centerY);

      for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        star.drawStar();
      }

      for (let i = 0; i < spaceships.length; i++) {
        let spaceship = spaceships[i];
        spaceship.draw();
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
