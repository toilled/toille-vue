<template>
  <li class="menu-item">
    <a
      :href="'#' + sectionId"
      @click.prevent="handleClick"
      :class="{ active: isActive }"
      >{{ page.name }}</a
    >
  </li>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from "vue";
import { Page } from "../interfaces/Page";

const props = defineProps<{
  page: Page;
}>();

const activeSection = inject<Ref<string>>("activeSection");
const navigateToSection = inject<(id: string, behavior?: ScrollBehavior) => void>("navigateToSection");

const sectionId = computed(() => {
  if (props.page.link === "/") return "home";
  return props.page.link.replace(/^\//, "");
});

const isActive = computed(() => {
  return activeSection?.value === sectionId.value;
});

function handleClick() {
  if (navigateToSection) {
    navigateToSection(sectionId.value);
  }
}
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
  border: 1px solid transparent;
}

.can-hover .menu-item a:hover {
  background: rgba(20, 30, 60, 0.6);
  box-shadow: 0 0 15px rgba(100, 149, 237, 0.5),
              0 0 5px rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  border-color: rgba(100, 149, 237, 0.3);
}

.menu-item a:active {
  background: rgba(40, 60, 100, 0.8);
  box-shadow: 0 0 25px rgba(100, 149, 237, 0.8),
              0 0 10px rgba(255, 255, 255, 0.5);
  transform: translateY(1px) scale(0.98);
  border-color: rgba(100, 149, 237, 0.8);
}

.menu-item a.active {
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
