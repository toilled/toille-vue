<template>
  <nav class="flex justify-center space-x-4">
    <MenuItem v-for="page in pages" :key="page.link" :page="page" />
  </nav>
</template>

<script setup lang="ts">
import MenuItem from "./MenuItem.vue";
import { Page } from "../interfaces/Page";

/**
 * @file Menu.vue
 * @description A component that renders a list of menu items based on a pages array.
 */

/**
 * @props {Object}
 * @property {Page[]} pages - An array of page objects to be rendered as menu items.
 */
defineProps<{
  pages: Page[];
}>();
</script>