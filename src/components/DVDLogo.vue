<template>
  <img
    ref="logo"
    src="/dvd-logo.svg"
    class="logo"
    :style="logoStyle"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

const logo = ref<HTMLImageElement | null>(null);
const posX = ref(0);
const posY = ref(0);
const velX = ref(1);
const velY = ref(1);
const speed = 2;
const color = ref('#ff0000');

const logoStyle = computed(() => ({
  transform: `translate(${posX.value}px, ${posY.value}px)`,
  filter: `drop-shadow(0 0 5px ${color.value})`,
  color: color.value,
}));

let animationFrameId: number;

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let newColor = '#';
  for (let i = 0; i < 6; i++) {
    newColor += letters[Math.floor(Math.random() * 16)];
  }
  return newColor;
}

function update() {
  if (!logo.value) return;

  const rect = logo.value.getBoundingClientRect();
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  let cornerHit = false;

  posX.value += velX.value * speed;
  posY.value += velY.value * speed;

  let hit = false;
  if (posX.value + rect.width >= screenWidth) {
    velX.value = -1;
    hit = true;
    if (posY.value + rect.height >= screenHeight || posY.value <= 0) cornerHit = true;
  }
  if (posX.value <= 0) {
    velX.value = 1;
    hit = true;
    if (posY.value + rect.height >= screenHeight || posY.value <= 0) cornerHit = true;
  }
  if (posY.value + rect.height >= screenHeight) {
    velY.value = -1;
    hit = true;
    if (posX.value + rect.width >= screenWidth || posX.value <= 0) cornerHit = true;
  }
  if (posY.value <= 0) {
    velY.value = 1;
    hit = true;
    if (posX.value + rect.width >= screenWidth || posX.value <= 0) cornerHit = true;
  }

  if (hit) {
    color.value = getRandomColor();
  }

  if (cornerHit) {
    const audio = new Audio('/celebration.mp3');
    audio.play();
  }

  animationFrameId = requestAnimationFrame(update);
}

onMounted(() => {
  if (logo.value) {
    logo.value.onload = () => {
      posX.value = Math.random() * (window.innerWidth - (logo.value?.width ?? 100));
      posY.value = Math.random() * (window.innerHeight - (logo.value?.height ?? 50));
      animationFrameId = requestAnimationFrame(update);
    };
  }
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped>
.logo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: auto;
  will-change: transform;
  color: v-bind(color);
}
</style>
