<template>
  <ul>
    <li>
      <hgroup class="title-container" ref="containerRef" @mousedown="handleTitleClick">
        <ManimScene v-if="showManim" :construct="constructTitle" :width="500" :height="100" />
        <template v-else>
          <h1
            class="title question"
            :class="{ 'space-warp': animatingTitle }"
          >
            {{ title }}
          </h1>
          <h2
            class="title question"
            :class="{ 'space-warp': animatingSubtitle }"
            @mousedown.stop="handleSubtitleClick"
          >
            {{ subtitle }}
          </h2>
        </template>
      </hgroup>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ManimScene } from "manim-web/vue";
import { Write, Text, Scene, FadeIn } from "manim-web";

/**
 * @file Title.vue
 * @description A component that displays a title and a subtitle.
 * It emits events when the title or subtitle is clicked.
 */

const props = defineProps<{
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
const showManim = ref(false);
let timeoutId: any = null;

onMounted(() => {
  // Use Manim animation on initial load
  showManim.value = true;
  // Use a timeout as a fallback or primary way to hide manim
  // The manim-web wait is async and can cause issues switching dom
  timeoutId = setTimeout(() => {
    showManim.value = false;
  }, 4000); // 1.5s write + 1s fade + 1s wait + 0.5s buffer
});

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});

async function constructTitle(scene: Scene) {
  const titleText = new Text(props.title, {
    fontSize: 48,
    color: '#00ffcc',
    font: 'Courier New'
  });

  const subtitleText = new Text(props.subtitle, {
    fontSize: 24,
    color: '#ffffff',
    font: 'Courier New'
  });

  titleText.moveTo({ x: 0, y: 10, z: 0 });
  subtitleText.moveTo({ x: 0, y: -20, z: 0 });

  await scene.play(new Write(titleText, { runTime: 1.5 }));
  await scene.play(new FadeIn(subtitleText, { runTime: 1 }));

  await scene.wait(1);
}

function handleTitleClick() {
  if (showManim.value) return;
  emit("activity");
  triggerAnimation(animatingTitle);
}

function handleSubtitleClick() {
  if (showManim.value) return;
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
.title-container {
  min-height: 100px; /* Keep space while loading */
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
