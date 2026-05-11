<template>
  <div class="section-divider">
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
  gap: 1rem;
  margin: 2rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 255, 204, 0.3),
    transparent
  );
}

.divider-icon {
  font-size: 1.5rem;
  opacity: 0.7;
}

.divider-dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(0, 255, 204, 0.4);
}

.dot:nth-child(2) {
  background: rgba(255, 0, 204, 0.5);
}

@media (max-width: 600px) {
  .section-divider {
    margin: 1.5rem 0;
    gap: 0.75rem;
  }
}
</style>
