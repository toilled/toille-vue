<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    class="icon"
    :title="title"
  >
    <text x="50%" y="75%" text-anchor="middle" font-size="20" font-weight="bold">?</text>
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
