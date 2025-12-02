<template>
  <div class="d-flex flex-column">
    <h1
      class="text-h4 font-weight-bold question cursor-pointer"
      :class="{ 'space-warp': animatingTitle }"
      @mousedown="handleTitleClick"
    >
      {{ title }}
    </h1>
    <h2
      class="text-subtitle-1 question cursor-pointer"
      style="opacity: 0.9;"
      :class="{ 'space-warp': animatingSubtitle }"
      @mousedown="handleSubtitleClick"
    >
      {{ subtitle }}
    </h2>
  </div>
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
  }, 1000); // Duration matches CSS animation
}
</script>

<style scoped>
.question {
  cursor: help;
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
</style>
