<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="icon"
    :title="title"
  >
    <path
      d="M16 13c.8 0 1.5.2 2.1.6 1.1 0 2.2 1.3 1.9 2.4-.2 1.1-1.3 1.6-2.4 1.6H7c-1.8 0-3.3-1.2-3.8-2.9-.5-1.7.3-3.6 1.9-4.3.4-2.8 2.8-5 5.7-5 2.1 0 4 .1 5.3 1.7"
    />
    <line x1="8" y1="19" x2="8" y2="21" />
    <line x1="12" y1="19" x2="12" y2="21" />
    <line x1="16" y1="19" x2="16" y2="21" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<style scoped>
.icon {
  width: 100%;
  height: 100%;
}
</style>
