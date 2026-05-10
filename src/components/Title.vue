<template>
  <hgroup class="site-title">
    <h1
      class="title question"
      :class="{ 'space-warp': animatingTitle }"
      @mousedown="handleTitleClick"
    >
      {{ title }}
    </h1>
    <h2
      class="subtitle question"
      :class="{ 'space-warp': animatingSubtitle }"
      @mousedown="handleSubtitleClick"
    >
      {{ subtitle }}
    </h2>
  </hgroup>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  title: string;
  subtitle: string;
  activity: boolean;
  joke: boolean;
}>();

const emit = defineEmits<{
  (e: "activity"): void;
  (e: "joke"): void;
}>();

const animatingTitle = ref(false);
const animatingSubtitle = ref(false);

function handleTitleClick() {
  emit("activity");
  triggerAnimation(animatingTitle);
}

function handleSubtitleClick() {
  emit("joke");
  triggerAnimation(animatingSubtitle);
}

function triggerAnimation(animatingRef: any) {
  if (animatingRef.value) return;
  animatingRef.value = true;
  setTimeout(() => {
    animatingRef.value = false;
  }, 1000);
}
</script>

<style scoped>
.site-title {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.site-title h1 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.2;
  letter-spacing: 0.02em;
}

.site-title h2 {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.3;
  font-weight: 400;
  opacity: 0.7;
}

.space-warp {
  animation: space-warp 1s ease-in-out;
}

@keyframes space-warp {
  0% {
    transform: scale(1);
    filter: hue-rotate(0deg);
  }
  25% {
    transform: scale(1.1) skewX(-10deg);
    filter: hue-rotate(90deg) drop-shadow(0 0 10px cyan);
  }
  50% {
    transform: scale(0.9) skewX(10deg);
    filter: hue-rotate(180deg) drop-shadow(0 0 10px magenta);
  }
  75% {
    transform: scale(1.05) skewX(-5deg);
    filter: hue-rotate(270deg) drop-shadow(0 0 10px cyan);
  }
  100% {
    transform: scale(1);
    filter: hue-rotate(360deg);
  }
}

@media (max-width: 768px) {
  .site-title {
    flex-direction: row;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .site-title h1 {
    font-size: 1.35rem;
  }
  .site-title h2 {
    font-size: 0.9rem;
  }
}
</style>
