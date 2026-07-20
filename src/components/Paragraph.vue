<template>
  <div class="text-paragraph" :class="{ marginless: last }" v-html="sanitizedParagraph"></div>
</template>

<script setup lang="ts">
import sanitize from 'sanitize-html';

/**
 * @file Paragraph.vue
 * @description Renders a single paragraph of text. It can apply a specific class if it's the last paragraph.
 * Uses sanitize-html to sanitize HTML content before rendering.
 */

/**
 * @props {Object}
 * @property {string} paragraph - The HTML content of the paragraph to be rendered.
 * @property {boolean} last - A boolean indicating if it's the last paragraph, used to apply a 'marginless' class.
 */
const props = defineProps<{
  paragraph: string;
  last: boolean;
}>();

/**
 * @type {import('vue').ComputedRef<string>}
 * @description A computed property that sanitizes the paragraph HTML using sanitize-html.
 */
const sanitizedParagraph = computed(() => {
  return sanitize(props.paragraph);
});
</script>
