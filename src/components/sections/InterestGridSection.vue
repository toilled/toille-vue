<template>
  <div class="interest-grid">
    <div v-for="(item, i) in items" :key="i" class="interest-item">
      <span class="interest-icon">{{ item.icon }}</span>
      <span>{{ item.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PageSectionItem } from '../../interfaces/Page';

defineProps<{
  items?: PageSectionItem[];
}>();
</script>

<style scoped>
.interest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin: 1.25rem 0;
}

.interest-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(10, 10, 20, 0.5);
  border: 1px solid rgba(0, 255, 204, 0.12);
  border-radius: 10px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.can-hover .interest-item:hover {
  background: rgba(20, 30, 60, 0.6);
  border-color: rgba(0, 255, 204, 0.25);
  transform: translateY(-1px);
}

.interest-icon {
  font-size: 1.25rem;
}

@media (max-width: 600px) {
  .interest-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
