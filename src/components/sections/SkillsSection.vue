<template>
  <h3 v-if="section.heading" class="sub-heading">{{ section.heading }}</h3>
  <SkillCard
    v-for="(group, i) in section.groups"
    :key="i"
    :skills="group.skills ?? []"
    v-bind="group.category ? { category: group.category } : {}"
  />
</template>

<script setup lang="ts">
import type { PageSection } from '../../interfaces/Page';
import SkillCard from '../SkillCard.vue';

defineProps<{
  section: PageSection;
}>();
</script>

<style scoped>
.sub-heading {
  margin: 1.75rem 0 1rem 0;
  font-size: 1.1rem;
  color: #ff00cc;
  letter-spacing: 0.02em;
}
</style>
