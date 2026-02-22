<template>
  <div class="text-paragraph" :class="{ marginless: last }" v-html="paragraph"></div>
</template>

<script setup lang="ts">
/**
 * @file Paragraph.vue
 * @description Renders a single paragraph of text. It can apply a specific class if it's the last paragraph.
 */

/**
 * @props {Object}
 * @property {string} paragraph - The HTML content of the paragraph to be rendered.
 * @property {boolean} last - A boolean indicating if this is the last paragraph, used to apply a 'marginless' class.
 */
defineProps<{
  paragraph: string;
  last: boolean;
}>();
</script>