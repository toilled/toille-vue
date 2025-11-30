<template>
  <li class="menu-item">
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

<style scoped>
.menu-item {
  margin: 10px 0;
}

.menu-item a {
  display: block;
  padding: 10px 20px;
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent; /* Reserve space for border */
}

/* Hover Effect: Subtle Space Glow */
.menu-item a:hover {
  background: rgba(20, 30, 60, 0.6); /* Deep space blue/purple */
  box-shadow: 0 0 15px rgba(100, 149, 237, 0.5), /* Cornflower blue glow */
              0 0 5px rgba(255, 255, 255, 0.2); /* Inner white hint */
  transform: translateY(-2px);
  border-color: rgba(100, 149, 237, 0.3);
}

/* Active/Click Effect: Intense Burst */
.menu-item a:active {
  background: rgba(40, 60, 100, 0.8);
  box-shadow: 0 0 25px rgba(100, 149, 237, 0.8),
              0 0 10px rgba(255, 255, 255, 0.5);
  transform: translateY(1px) scale(0.98);
  border-color: rgba(100, 149, 237, 0.8);
}

/* Current Page Indicator */
.menu-item a.router-link-active {
  background: rgba(30, 45, 80, 0.7);
  box-shadow: 0 0 10px rgba(100, 149, 237, 0.4);
  border-color: rgba(100, 149, 237, 0.5);
}

@media (max-width: 600px) {
  .menu-item {
    margin: 5px 0;
  }

  .menu-item a {
    padding: 8px 15px;
  }
}
</style>