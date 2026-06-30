<template>
  <div class="terminal-body" ref="bodyRef">
    <div v-for="(line, i) in lines" :key="i" class="terminal-line" :class="line.class">
      <pre v-if="line.pre">{{ line.text }}</pre>
      <span v-else-if="!line.pre">{{ line.text }}</span>
    </div>
    <div v-if="!animating" class="terminal-input-line">
      <span class="prompt">{{ prompt }}</span>
      <span class="input-text">{{ currentInput }}</span>
      <span class="cursor" :class="{ blink: !animating }">&#9608;</span>
    </div>
    <div v-if="animating" class="terminal-line boot-line">
      <span>{{ bootText }}</span>
      <span class="cursor blink">&#9608;</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  lines: { text: string; pre?: boolean; class?: string }[];
  animating: boolean;
  currentInput: string;
  bootText: string;
  prompt: string;
}>();

const bodyRef = ref<HTMLElement | null>(null);

function scrollToBottom() {
  if (bodyRef.value) {
    bodyRef.value.scrollTop = 999999;
  }
}

defineExpose({ bodyRef, scrollToBottom });
</script>

<style scoped>
.terminal-body {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
  min-height: 300px;
  max-height: calc(80vh - 42px);
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 204, 0.3) transparent;
}

.terminal-body::-webkit-scrollbar {
  width: 4px;
}

.terminal-body::-webkit-scrollbar-track {
  background: transparent;
}

.terminal-body::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 204, 0.3);
  border-radius: 2px;
}

.terminal-line {
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 1px;
}

.terminal-line pre {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  white-space: pre;
  overflow-x: auto;
}

.terminal-line.error {
  color: #ff5f56;
}

.terminal-line.info {
  color: rgba(0, 255, 204, 0.7);
}

.terminal-line.fortune {
  font-style: italic;
  color: rgba(0, 255, 204, 0.8);
}

.terminal-line.matrix {
  color: rgba(0, 255, 0, 0.6);
  font-size: 0.75rem;
  line-height: 1.1;
}

.terminal-line.rainbow {
  background: linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.terminal-line.banner {
  color: #ff00cc;
  font-weight: bold;
}

.terminal-line.help {
  color: rgba(0, 255, 204, 0.85);
  font-size: 0.8rem;
}

.terminal-line.neofetch {
  color: #00ffcc;
}

.terminal-line.scan {
  color: rgba(0, 255, 204, 0.75);
}

.terminal-line.story {
  color: rgba(255, 0, 204, 0.8);
}

.terminal-line.city {
  color: rgba(0, 255, 204, 0.85);
}

.terminal-line.skills {
  color: rgba(0, 255, 204, 0.8);
}

.terminal-input-line {
  display: flex;
  align-items: center;
  gap: 0;
  white-space: pre;
}

.prompt {
  color: #ff00cc;
  flex-shrink: 0;
}

.input-text {
  color: #00ffcc;
}

.cursor {
  color: #00ffcc;
  animation: blink-anim 0.8s step-end infinite;
  margin-left: 1px;
  line-height: 1;
}

.cursor.blink {
  animation: blink-anim 0.8s step-end infinite;
}

@keyframes blink-anim {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
