<template>
  <li>
    <router-link :to="page.link">{{ page.name }}</router-link>
  </li>
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