<template>
  <p :class="{ 'mb-0': last, 'mb-4': !last }" v-html="paragraph" class="text-body-1"></p>
</template>

<script setup lang="ts">
defineProps<{
  paragraph: string;
  last: boolean;
}>();
</script>
