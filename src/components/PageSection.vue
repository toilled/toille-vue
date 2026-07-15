<template>
  <template v-if="section.type === 'divider'">
    <SectionDivider v-bind="section.icon ? { icon: section.icon } : {}" />
  </template>

  <template v-else-if="section.type === 'cards'">
    <h3 v-if="section.heading" class="sub-heading">{{ section.heading }}</h3>
    <div class="what-i-do-grid" :style="{ '--columns': section.columns || 3 }">
      <div v-for="(item, i) in section.items" :key="i" class="do-card">
        <div class="do-card-accent" :class="accentClass(i)"></div>
        <div class="do-card-icon">{{ item.icon }}</div>
        <h4 class="do-card-title">{{ item.title }}</h4>
        <p class="do-card-desc">{{ item.description }}</p>
      </div>
    </div>
  </template>

  <template v-else-if="section.type === 'skills'">
    <h3 v-if="section.heading" class="sub-heading">{{ section.heading }}</h3>
    <SkillCard
      v-for="(group, i) in section.groups"
      :key="i"
      :skills="group.skills ?? []"
      v-bind="group.category ? { category: group.category } : {}"
    />
  </template>

  <template v-else-if="section.type === 'musicCard'">
    <h3 v-if="section.heading" class="sub-heading">{{ section.heading }}</h3>
    <div class="music-card">
      <div v-if="section.icon" class="music-icon">{{ section.icon }}</div>
      <div class="music-content">
        <h4>{{ section.title }}</h4>
        <p>{{ section.description }}</p>
        <a
          v-if="section.linkUrl"
          :href="section.linkUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="music-link"
        >
          {{ section.linkText }}
        </a>
      </div>
    </div>
  </template>

  <template v-else-if="section.type === 'interestGrid'">
    <div class="interest-grid">
      <div v-for="(item, i) in section.items" :key="i" class="interest-item">
        <span class="interest-icon">{{ item.icon }}</span>
        <span>{{ item.text }}</span>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { PageSection as PageSectionType } from '../interfaces/Page';
import { accentClass } from '../utils/pageUtils';
import SectionDivider from './SectionDivider.vue';
import SkillCard from './SkillCard.vue';

defineProps<{
  section: PageSectionType;
}>();
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

.music-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 0, 204, 0.08), rgba(0, 255, 204, 0.08));
  border: 1px solid rgba(255, 0, 204, 0.2);
  border-radius: 14px;
  margin: 1.25rem 0;
  transition: all 0.3s ease;
}

.can-hover .music-card:hover {
  background: linear-gradient(135deg, rgba(255, 0, 204, 0.12), rgba(0, 255, 204, 0.12));
  border-color: rgba(255, 0, 204, 0.35);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.music-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.music-content h4 {
  margin: 0 0 0.4rem 0;
  font-size: 1rem;
  color: #fff;
}

.music-content p {
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  color: #b0b0cc;
}

.music-link {
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

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
  .music-card {
    flex-direction: column;
    text-align: center;
  }
  .interest-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .what-i-do-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>
