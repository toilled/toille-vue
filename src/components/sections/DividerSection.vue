<template>
  <SectionDivider v-bind="section.icon ? { icon: section.icon } : {}" />
</template>

<script setup lang="ts">
import type { PageSection } from '../../interfaces/Page';
import SectionDivider from '../SectionDivider.vue';

defineProps<{
  section: PageSection;
}>();
</script>
