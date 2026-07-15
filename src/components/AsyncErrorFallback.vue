<template>
  <div class="async-error" role="alert">
    <p>Failed to load component.</p>
    <button @click="retry" class="retry-btn">Retry</button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'retry'): void;
}>();

function retry() {
  emit('retry');
}
</script>

<style scoped>
.async-error {
  padding: 1rem;
  text-align: center;
  color: #ff5f56;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
}

.retry-btn {
  margin-top: 0.5rem;
  padding: 0.4rem 1rem;
  background: transparent;
  border: 1px solid #ff5f56;
  color: #ff5f56;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.8rem;
}

.retry-btn:hover {
  background: rgba(255, 95, 86, 0.15);
}
</style>
