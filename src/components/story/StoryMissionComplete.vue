<template>
  <Transition name="fade-up">
    <div v-if="currentMission" id="mission-complete">
      <div id="complete-header">MISSION COMPLETE</div>
      <div id="complete-divider">▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▄▀▄▀▄▀</div>
      <div id="complete-message">{{ currentMission.completeMessage }}</div>
      <div id="complete-hint" v-if="hasNextMission">NEXT MISSION INCOMING...</div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { StoryMission } from '../../game/types';

defineProps<{ currentMission: StoryMission | null; hasNextMission: boolean }>();
</script>

<style scoped>
#mission-complete {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

#complete-header {
  font-family: 'Courier New', Courier, monospace;
  font-size: 24px;
  font-weight: bold;
  color: #ffcc00;
  text-shadow: 0 0 20px rgba(255, 204, 0, 0.5);
  letter-spacing: 6px;
  margin-bottom: 8px;
}

#complete-divider {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  color: rgba(255, 204, 0, 0.2);
  margin-bottom: 16px;
}

#complete-message {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #d0d0f0;
  max-width: 400px;
  line-height: 1.6;
}

#complete-hint {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  color: #00ffcc;
  margin-top: 20px;
  letter-spacing: 2px;
  animation: pulse 1.5s infinite;
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

.fade-up-enter-active {
  animation: fade-up-in 0.5s ease-out;
}

.fade-up-leave-active {
  animation: fade-up-out 0.3s ease-in;
}

@keyframes fade-up-in {
  0% {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

@keyframes fade-up-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
