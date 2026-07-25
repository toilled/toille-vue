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
    <path d="M4 14h24" />
    <path d="M4 19h24" />
    <path d="M4 9h24" />
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
