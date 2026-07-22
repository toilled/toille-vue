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
  background: linear-gradient(165deg, rgba(10, 10, 25, 0.65) 0%, rgba(5, 8, 20, 0.75) 100%);
  border: 1px solid rgba(0, 255, 204, 0.12);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.15),
    0 4px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  transform: translateZ(0);
}

.do-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.can-hover .do-card:hover {
  background: linear-gradient(165deg, rgba(15, 20, 45, 0.85) 0%, rgba(10, 15, 35, 0.9) 100%);
  border-color: rgba(0, 255, 204, 0.3);
  transform: translateY(-3px) translateZ(0);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 8px 16px rgba(0, 0, 0, 0.2),
    0 16px 32px rgba(0, 0, 0, 0.15),
    0 0 12px rgba(0, 255, 204, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.can-hover .do-card:hover .do-card-accent {
  height: 4px;
  filter: brightness(1.3);
  box-shadow:
    0 0 12px currentColor,
    0 2px 8px rgba(0, 0, 0, 0.2);
}

.do-card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 14px 14px 0 0;
  transition: all 0.35s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
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
