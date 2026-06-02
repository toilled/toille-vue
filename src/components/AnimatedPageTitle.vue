<template>
  <h2 class="title animated-title" ref="titleRef">
    <span v-if="pageIcon" class="page-icon">{{ pageIcon }} </span>
    <span class="typewriter-text">{{ displayText }}</span><span class="cursor" :class="{ 'cursor-blink': cursorVisible }">|</span>
  </h2>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { easeOutCubic } from "@motion-canvas/core";

const animatedSections = new Set<string>();

const props = defineProps<{
  title: string;
  sectionId: string;
  pageIcon?: string;
  autoAnimate?: boolean;
}>();

const activeSection = inject<Ref<string>>("activeSection");
const titleRef = ref<HTMLElement | null>(null);

const displayText = ref("");
const cursorVisible = ref(false);

let rafId: number | null = null;
let cursorInterval: ReturnType<typeof setInterval> | null = null;
let cursorTimeoutId: ReturnType<typeof setTimeout> | null = null;
let mounted = false;

const DURATION_MS = 700;
const CURSOR_BLINK_MS = 530;

function showFullText() {
  displayText.value = [...props.title].join("");
  startCursor();
}

function startAnimation() {
  stopAnimation();

  if (animatedSections.has(props.sectionId)) {
    showFullText();
    return;
  }
  animatedSections.add(props.sectionId);

  displayText.value = "";
  cursorVisible.value = false;

  const chars = [...props.title];
  if (chars.length === 0) return;

  const startTime = performance.now();

  function frame(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / DURATION_MS, 1);
    const eased = easeOutCubic(progress);
    const count = Math.max(1, Math.floor(eased * chars.length));
    displayText.value = chars.slice(0, count).join("");

    if (progress < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      displayText.value = chars.join("");
      startCursor();
    }
  }

  rafId = requestAnimationFrame(frame);
}

function startCursor() {
  cursorVisible.value = true;
  cursorInterval = setInterval(() => {
    cursorVisible.value = !cursorVisible.value;
  }, CURSOR_BLINK_MS);
  cursorTimeoutId = setTimeout(() => {
    if (cursorInterval !== null) {
      clearInterval(cursorInterval);
      cursorInterval = null;
    }
    cursorVisible.value = false;
  }, 2000);
}

function stopAnimation() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (cursorInterval !== null) {
    clearInterval(cursorInterval);
    cursorInterval = null;
  }
  if (cursorTimeoutId !== null) {
    clearTimeout(cursorTimeoutId);
    cursorTimeoutId = null;
  }
  cursorVisible.value = false;
}

watch(
  activeSection,
  (newSection, oldSection) => {
    if (typeof window === "undefined") return;
    if (newSection === props.sectionId && newSection !== oldSection) {
      startAnimation();
    }
  }
);

onMounted(() => {
  mounted = true;
  if (props.autoAnimate || activeSection?.value === props.sectionId) {
    startAnimation();
  }
});

onUnmounted(() => {
  mounted = false;
  stopAnimation();
});
</script>

<style scoped>
.animated-title {
  display: inline-flex;
  align-items: center;
  gap: 0;
  white-space: nowrap;
}

.page-icon {
  margin-right: 0.5rem;
  display: inline-block;
  vertical-align: middle;
}

.cursor {
  display: inline-block;
  color: #00ffcc;
  font-weight: 300;
  margin-left: 1px;
  opacity: 0;
  transition: opacity 0.1s;
}

.cursor-blink {
  opacity: 1;
  animation: cursorBlink 530ms step-end infinite;
}

@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
