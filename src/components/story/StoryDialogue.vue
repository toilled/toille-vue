<template>
  <div id="story-dialogue" @click="emit('advance')">
    <div id="dialogue-window">
      <div id="dialogue-header">
        <span class="dialogue-tag">INCOMING TRANSMISSION</span>
        <span class="dialogue-progress"
          >{{ dialogueIndex + 1 }}/{{ currentMission?.dialogue.length }}</span
        >
      </div>
      <div id="dialogue-divider">────────────────────────────────</div>
      <div id="dialogue-text">
        <span
          v-for="(char, i) in displayedText"
          :key="i"
          :class="{ glitch: char === '[' || char === ']' }"
          >{{ char }}</span
        >
        <span v-if="isTyping" class="cursor-blink">▌</span>
      </div>
      <div id="dialogue-ai-notice">[ STORY CONTENT AI-GENERATED ]</div>
      <div id="dialogue-hint" v-if="!isTyping">[ CLICK or press E to continue ]</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StoryMission } from '../../game/types';

defineProps<{
  currentMission: StoryMission | null;
  displayedText: string;
  isTyping: boolean;
  dialogueIndex: number;
}>();
const emit = defineEmits<{ (e: 'advance'): void }>();
</script>

<style scoped>
#story-dialogue {
  pointer-events: auto;
  cursor: pointer;
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 600px;
}

#dialogue-window {
  background: rgba(5, 5, 20, 0.92);
  border: 1px solid rgba(0, 255, 204, 0.25);
  box-shadow: 0 0 30px rgba(0, 255, 204, 0.08);
  padding: 20px 24px;
  animation: slide-up 0.25s ease-out;
}

#dialogue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.dialogue-tag {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  color: #00ffcc;
  letter-spacing: 2px;
  text-shadow: 0 0 6px rgba(0, 255, 204, 0.3);
}

.dialogue-progress {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  color: rgba(0, 255, 204, 0.3);
}

#dialogue-divider {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  color: rgba(0, 255, 204, 0.15);
  margin-bottom: 12px;
}

#dialogue-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  color: #d0d0f0;
  line-height: 1.7;
  min-height: 60px;
}

#dialogue-text .glitch {
  color: #ff00cc;
  text-shadow: 0 0 6px #ff00cc;
}

.cursor-blink {
  color: #00ffcc;
  animation: blink 0.6s step-end infinite;
}

#dialogue-ai-notice {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  color: rgba(255, 0, 204, 0.7);
  letter-spacing: 2px;
  text-align: center;
  margin-top: 8px;
  text-shadow: 0 0 4px rgba(255, 0, 204, 0.3);
}

#dialogue-hint {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  color: rgba(0, 255, 204, 0.3);
  margin-top: 12px;
  letter-spacing: 1px;
  animation: pulse 2s infinite;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>
