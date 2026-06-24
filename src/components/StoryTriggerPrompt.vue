<template>
  <Transition name="fade">
    <div v-if="visible" id="story-trigger-prompt">[E] EXAMINE DEAD DROP</div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();
</script>

<style scoped>
#story-trigger-prompt {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  color: #ff00cc;
  text-shadow:
    0 0 12px #ff00cc,
    0 0 24px rgba(255, 0, 204, 0.5);
  letter-spacing: 3px;
  z-index: 25;
  pointer-events: none;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
