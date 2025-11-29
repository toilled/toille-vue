<template>
  <ul>
    <li>
      <hgroup>
        <h1
          class="title question"
          :class="{ 'space-warp': animatingTitle }"
          @mousedown="handleTitleClick"
        >
          {{ title }}
        </h1>
        <h2
          class="title question"
          :class="{ 'space-warp': animatingSubtitle }"
          @mousedown="handleSubtitleClick"
        >
          {{ subtitle }}
        </h2>
      </hgroup>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from "vue";

/**
 * @file Title.vue
 * @description A component that displays a title and a subtitle.
 * It emits events when the title or subtitle is clicked.
 */

/**
 * @props {Object}
 * @property {string} title - The main title text.
 * @property {string} subtitle - The subtitle text.
 * @property {boolean} activity - A boolean prop (not directly used in script, but likely for parent logic).
 * @property {boolean} joke - A boolean prop (not directly used in script, but likely for parent logic).
 */
defineProps<{
  title: string;
  subtitle: string;
  activity: boolean;
  joke: boolean;
}>();

/**
 * @emits activity - Emitted when the main title is clicked.
 * @emits joke - Emitted when the subtitle is clicked.
 */
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