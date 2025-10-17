<template>
  <router-link
    :to="page.link"
    class="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-700"
    >{{ page.name }}</router-link
  >
</template>

<script setup lang="ts">
import { Page } from "../interfaces/Page";

/**
 * @file MenuItem.vue
 * @description A component that displays a single menu item as a router link.
 */

/**
 * @props {Object}
 * @property {Page} page - The page object containing the link and name for the menu item.
 */
defineProps<{
  page: Page;
}>();
</script>