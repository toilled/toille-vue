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
    <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 15.25" />
    <path d="M8 16h.01" />
    <path d="M8 20h.01" />
    <path d="M12 18h.01" />
    <path d="M12 22h.01" />
    <path d="M16 18h.01" />
    <path d="M16 22h.01" />
    <path d="M20 16h.01" />
    <path d="M20 20h.01" />
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
