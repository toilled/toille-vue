<template>
  <div id="story-briefing" @click="emit('dismiss')">
    <div id="briefing-header">
      <span class="briefing-tag">MISSION</span>
      <span class="briefing-id">{{ currentMission?.id?.toUpperCase().replace(/-/g, ' ') }}</span>
    </div>
    <div id="briefing-title">{{ currentMission?.title }}</div>
    <div id="briefing-divider">▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀</div>
    <div id="briefing-text">{{ currentMission?.brief }}</div>
    <div id="briefing-objectives" v-if="currentMission">
      <div class="objective-header">OBJECTIVES:</div>
      <div v-for="(obj, idx) in currentMission.objectives" :key="idx" class="objective-item">
        <span class="obj-marker">{{ obj.completed ? '█' : '▣' }}</span>
        <span :class="{ completed: obj.completed }">{{ obj.label }}</span>
      </div>
    </div>
    <div id="briefing-hint">[ CLICK or press E to continue ]</div>
  </div>
</template>

<script setup lang="ts">
import { StoryMission } from '../../game/types';

defineProps<{ currentMission: StoryMission | null }>();
const emit = defineEmits<{ (e: 'dismiss'): void }>();
</script>

<style scoped>
#story-briefing {
  pointer-events: auto;
  cursor: pointer;
  background: rgba(5, 5, 20, 0.92);
  border: 1px solid rgba(0, 255, 204, 0.3);
  box-shadow:
    0 0 40px rgba(0, 255, 204, 0.1),
    inset 0 0 40px rgba(0, 0, 0, 0.5);
  padding: 30px;
  max-width: 560px;
  width: 90%;
  animation: scan-in 0.3s ease-out;
}

#briefing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.briefing-tag {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  color: #ff00cc;
  letter-spacing: 3px;
  text-shadow: 0 0 8px #ff00cc;
}

.briefing-id {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  color: rgba(0, 255, 204, 0.4);
  letter-spacing: 1px;
}

#briefing-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: 28px;
  font-weight: bold;
  color: #00ffcc;
  text-shadow: 0 0 15px rgba(0, 255, 204, 0.5);
  margin-bottom: 8px;
  letter-spacing: 4px;
}

#briefing-divider {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  color: rgba(0, 255, 204, 0.2);
  margin-bottom: 16px;
  letter-spacing: -1px;
}

#briefing-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #c0c0e0;
  line-height: 1.6;
  margin-bottom: 20px;
}

#briefing-objectives {
  margin-bottom: 16px;
}

.objective-header {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  color: #ff00cc;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.objective-item {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  color: #e0e0ff;
  margin: 4px 0;
  display: flex;
  gap: 8px;
}

.obj-marker {
  color: #00ffcc;
}

.objective-item .completed {
  color: rgba(0, 255, 204, 0.4);
  text-decoration: line-through;
}

#briefing-hint {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  color: rgba(0, 255, 204, 0.4);
  letter-spacing: 1px;
  animation: pulse 2s infinite;
}

@keyframes scan-in {
  from {
    opacity: 0;
    transform: scaleY(0.95) translateY(-10px);
    filter: hue-rotate(30deg);
  }
  to {
    opacity: 1;
    transform: scaleY(1) translateY(0);
    filter: hue-rotate(0);
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
</style>
