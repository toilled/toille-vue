<template>
  <div>
    <h3 v-if="heading" class="sub-heading">{{ heading }}</h3>
    <div class="what-i-do-grid" :style="{ '--columns': columns || 3 }">
      <div v-for="(item, i) in items" :key="i" class="do-card">
        <div class="do-card-accent" :class="accentClass(i)"></div>
        <div class="do-card-icon">{{ item.icon }}</div>
        <h4 class="do-card-title">{{ item.title }}</h4>
        <p class="do-card-desc">{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PageSectionItem } from '../../interfaces/Page';

defineProps<{
  heading?: string;
  columns?: number;
  items?: PageSectionItem[];
}>();

function accentClass(index: number): string {
  const classes = ['fullstack', 'ux', 'interactive'];
  return classes[index % classes.length];
}
</script>

<style scoped>
.sub-heading {
  margin: 1.75rem 0 1rem 0;
  font-size: 1.1rem;
  color: #ff00cc;
  letter-spacing: 0.02em;
}

.what-i-do-grid {
  display: grid;
  grid-template-columns: repeat(var(--columns, 3), 1fr);
  gap: 1rem;
  margin: 1.25rem 0;
}

.do-card {
  position: relative;
  padding: 1.5rem 1.25rem;
  background: rgba(10, 10, 20, 0.5);
  border: 1px solid rgba(0, 255, 204, 0.12);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.35s ease;
}

.can-hover .do-card:hover {
  background: rgba(15, 20, 40, 0.7);
  border-color: rgba(0, 255, 204, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.can-hover .do-card:hover .do-card-accent {
  height: 4px;
  filter: brightness(1.3);
  box-shadow: 0 0 12px currentColor;
}

.do-card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 14px 14px 0 0;
  transition: all 0.35s ease;
}

.do-card-accent.fullstack {
  background: linear-gradient(90deg, #00ffcc, #00ccff);
}

.do-card-accent.ux {
  background: linear-gradient(90deg, #ff00cc, #ff6600);
}

.do-card-accent.interactive {
  background: linear-gradient(90deg, #cc00ff, #00ffcc);
}

.do-card-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  display: block;
}

.do-card-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #fff;
  letter-spacing: 0.01em;
}

.do-card-desc {
  margin: 0;
  font-size: 0.82rem;
  color: #b0b0cc;
  line-height: 1.55;
}

@media (max-width: 600px) {
  .what-i-do-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>
