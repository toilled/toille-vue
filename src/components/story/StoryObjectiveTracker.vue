<template>
  <div id="objective-tracker">
    <div id="tracker-header">{{ currentMission?.title }}</div>
    <div
      v-for="(obj, idx) in currentMission?.objectives"
      :key="idx"
      class="tracker-item"
      :class="{ done: obj.completed }"
    >
      <span class="tracker-marker">{{ obj.completed ? '█' : '▣' }}</span>
      <span>{{ obj.label }}</span>
      <span class="tracker-status">{{ obj.completed ? '[DONE]' : '[PENDING]' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StoryMission } from '../../game/types';

defineProps<{ currentMission: StoryMission | null }>();
</script>

<style scoped>
#objective-tracker {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 15;
  background: rgba(5, 5, 20, 0.8);
  border: 1px solid rgba(0, 255, 204, 0.15);
  padding: 10px 14px;
  min-width: 180px;
  pointer-events: none;
}

#tracker-header {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  font-weight: bold;
  color: #00ffcc;
  letter-spacing: 2px;
  margin-bottom: 6px;
  text-shadow: 0 0 8px rgba(0, 255, 204, 0.3);
}

.tracker-item {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  color: #c0c0e0;
  display: flex;
  gap: 6px;
  margin: 3px 0;
  align-items: center;
}

.tracker-item.done {
  color: rgba(0, 255, 204, 0.3);
}

.tracker-marker {
  color: #00ffcc;
  flex-shrink: 0;
}

.tracker-item.done .tracker-marker {
  color: rgba(0, 255, 204, 0.3);
}

.tracker-status {
  margin-left: auto;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.2);
}

.tracker-item.done .tracker-status {
  color: rgba(0, 255, 204, 0.2);
}
</style>
