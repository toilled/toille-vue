<script setup lang="ts">
import { useHead } from "#app";
import titles from "./titles.json";

useHead({
  title: `Elliot > ${titles.title}`,
});
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
