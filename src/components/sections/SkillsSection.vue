<template>
  <div>
    <h3 v-if="heading" class="sub-heading">{{ heading }}</h3>
    <SkillCard
      v-for="(group, i) in groups"
      :key="i"
      :skills="group.skills ?? []"
      v-bind="group.category ? { category: group.category } : {}"
    />
  </div>
</template>

<script setup lang="ts">
import type { PageSectionGroup } from '../../interfaces/Page';
import SkillCard from '../SkillCard.vue';

defineProps<{
  heading?: string;
  groups?: PageSectionGroup[];
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
