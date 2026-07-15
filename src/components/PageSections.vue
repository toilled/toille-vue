<template>
  <template v-for="(section, index) in sections" :key="index">
    <SectionDivider
      v-if="section.type === 'divider'"
      v-bind="section.icon ? { icon: section.icon } : {}"
    />
    <CardsSection v-else-if="section.type === 'cards'" v-bind="sectionBind(section)" />
    <SkillsSection v-else-if="section.type === 'skills'" v-bind="sectionBind(section)" />
    <MusicCardSection v-else-if="section.type === 'musicCard'" v-bind="sectionBind(section)" />
    <InterestGridSection
      v-else-if="section.type === 'interestGrid'"
      v-bind="sectionBind(section)"
    />
  </template>
</template>

<script setup lang="ts">
import type { PageSection } from '../interfaces/Page';
import SectionDivider from './SectionDivider.vue';
import CardsSection from './sections/CardsSection.vue';
import SkillsSection from './sections/SkillsSection.vue';
import MusicCardSection from './sections/MusicCardSection.vue';
import InterestGridSection from './sections/InterestGridSection.vue';

defineProps<{
  sections?: PageSection[];
}>();

function sectionBind(section: PageSection): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(section)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}
</script>
