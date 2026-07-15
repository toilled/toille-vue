<template>
  <component :is="sectionComponent" :section="section" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PageSection } from '../interfaces/Page';
import DividerSection from './sections/DividerSection.vue';
import CardsSection from './sections/CardsSection.vue';
import SkillsSection from './sections/SkillsSection.vue';
import MusicCardSection from './sections/MusicCardSection.vue';
import InterestGridSection from './sections/InterestGridSection.vue';

const props = defineProps<{
  section: PageSection;
}>();

const sectionComponents: Record<string, typeof DividerSection> = {
  divider: DividerSection,
  cards: CardsSection,
  skills: SkillsSection,
  musicCard: MusicCardSection,
  interestGrid: InterestGridSection,
};

const sectionComponent = computed(() => sectionComponents[props.section.type]);
</script>
