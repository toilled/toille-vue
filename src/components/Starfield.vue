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
  let numberOfSpaceships = 5;

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

  class Spaceship {
    x: number;
    y: number;
    size: number;
    speed: number;
    angle: number;
    context: CanvasRenderingContext2D;

    constructor() {
      this.x = Math.random() * canvasWidth;
      this.y = Math.random() * canvasHeight;
      this.size = Math.random() * 20 + 10;
      this.speed = Math.random() * 2 + 1;
      this.angle = Math.random() * Math.PI * 2;
      this.context = mainContext as CanvasRenderingContext2D;
    }

    draw() {
      this.context.save();
      this.context.translate(this.x, this.y);
      this.context.rotate(this.angle);
      this.context.fillStyle = 'white';
      this.context.beginPath();
      this.context.moveTo(0, -this.size);
      this.context.lineTo(this.size / 2, this.size / 2);
      this.context.lineTo(-this.size / 2, this.size / 2);
      this.context.closePath();
      this.context.fill();
      this.context.restore();
    }

    update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      if (this.x < 0) {
        this.x = canvasWidth;
      }
      if (this.x > canvasWidth) {
        this.x = 0;
      }
      if (this.y < 0) {
        this.y = canvasHeight;
      }
      if (this.y > canvasHeight) {
        this.y = 0;
      }
    }
  }

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
      this.speed = getRandomInt(5, 10);
      this.color = `rgba(255, 255, 255, ${0.8 + Math.random() * 0.2})`;
      this.isSpiky = Math.random() > 0.5;

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

      const gradient = mainContext!.createRadialGradient(starX, starY, 0, starX, starY, outerRadius * 2);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      mainContext!.fillStyle = gradient;

      if (this.isSpiky) {
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
        mainContext!.fill();
      } else {
        mainContext!.beginPath();
        mainContext!.arc(starX, starY, outerRadius, 0, Math.PI * 2);
        mainContext!.fill();
      }
    }
  }

  function setup() {
    for (let i = 0; i < numberOfStars; i++) {
      let star = new Star();
      stars.push(star);
    }

    for (let i = 0; i < numberOfSpaceships; i++) {
      let spaceship = new Spaceship();
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

      mainContext!.translate(-centerX, -centerY);

      for (let i = 0; i < spaceships.length; i++) {
        let spaceship = spaceships[i];
        spaceship.update();
        spaceship.draw();
      }
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
