<template>
  <div class="text-center">
    <h1
      class="text-4xl font-bold title question"
      @mousedown="$emit('activity')"
    >
      {{ title }}
    </h1>
    <h2 class="text-2xl title question" @mousedown="$emit('joke')">
      {{ subtitle }}
    </h2>
  </div>
</template>

<script setup lang="ts">
/**
 * @file Title.vue
 * @description A component that displays a title and a subtitle.
 * It emits events when the title or subtitle is clicked.
 */

/**
 * @props {Object}
 * @property {string} title - The main title text.
 * @property {string} subtitle - The subtitle text.
 * @property {boolean} activity - A boolean prop (not directly used in script, but likely for parent logic).
 * @property {boolean} joke - A boolean prop (not directly used in script, but likely for parent logic).
 */
defineProps<{
  title: string;
  subtitle: string;
  activity: boolean;
  joke: boolean;
}>();

/**
 * @emits activity - Emitted when the main title is clicked.
 * @emits joke - Emitted when the subtitle is clicked.
 */
defineEmits<{
  (e: "activity"): void;
  (e: "joke"): void;
}>();
</script>