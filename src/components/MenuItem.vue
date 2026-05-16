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
  padding: 8px 16px;
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  font-size: 0.9rem;
}

.can-hover .menu-item a:hover {
  background: rgba(0, 255, 204, 0.06);
  box-shadow: 0 0 12px rgba(0, 255, 204, 0.1);
  transform: translateY(-1px);
  border-color: rgba(0, 255, 204, 0.2);
}

.menu-item a.active {
  background: rgba(0, 255, 204, 0.08);
  border-color: rgba(0, 255, 204, 0.25);
  box-shadow: 0 0 8px rgba(0, 255, 204, 0.08);
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
