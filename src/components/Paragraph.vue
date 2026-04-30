<template>
  <div class="text-paragraph" :class="{ marginless: last }" v-html="sanitizedParagraph"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DOMPurify from 'dompurify';

/**
 * @file Paragraph.vue
 * @description Renders a single paragraph of text. It can apply a specific class if it's the last paragraph.
 * Uses DOMPurify to sanitize HTML content before rendering.
 */

/**
 * @props {Object}
 * @property {string} paragraph - The HTML content of the paragraph to be rendered.
 * @property {boolean} last - A boolean indicating if this is the last paragraph, used to apply a 'marginless' class.
 */
const props = defineProps<{
  paragraph: string;
  last: boolean;
}>();

/**
 * @type {import('vue').ComputedRef<string>}
 * @description A computed property that sanitizes the paragraph HTML using DOMPurify.
 */
const sanitizedParagraph = computed(() => DOMPurify.sanitize(props.paragraph));
</script>
