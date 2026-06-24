<template>
  <Transition name="fade">
    <div v-if="visible" id="story-hint">
      A faint encrypted transmission originates from the northwest...
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();
</script>

<style scoped>
#story-hint {
  position: fixed;
  bottom: 150px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  color: rgba(255, 0, 204, 0.6);
  text-shadow: 0 0 8px rgba(255, 0, 204, 0.2);
  letter-spacing: 1px;
  z-index: 25;
  pointer-events: none;
  text-align: center;
}
</style>
