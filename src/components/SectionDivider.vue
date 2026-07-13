<template>
  <div class="section-divider" role="separator" aria-hidden="true">
    <div class="divider-line"></div>
    <div v-if="icon" class="divider-icon">{{ icon }}</div>
    <div v-else class="divider-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
    <div class="divider-line"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
}>();
</script>

<style scoped>
.section-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 1.75rem 0;
  opacity: 0.6;
}

.divider-line {
  flex: 1;
  max-width: 120px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 204, 0.3), transparent);
}

.divider-icon {
  font-size: 1.2rem;
  opacity: 0.7;
  animation: divider-pulse 3s ease-in-out infinite;
}

.divider-dots {
  display: flex;
  gap: 0.4rem;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(0, 255, 204, 0.4);
  animation: dot-pulse 2s ease-in-out infinite;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}
.dot:nth-child(2) {
  background: rgba(255, 0, 204, 0.5);
  animation-delay: 0.3s;
}
.dot:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes divider-pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.4);
    box-shadow: 0 0 6px currentColor;
  }
}

@media (max-width: 600px) {
  .section-divider {
    margin: 1.25rem 0;
    gap: 0.5rem;
  }
}
</style>
