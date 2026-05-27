<template>
  <li class="menu-item">
    <a
      :href="'#' + sectionId"
      @click.prevent="handleClick"
      :class="{ active: isActive }"
    >
      <span v-if="page.icon" class="nav-icon">{{ page.icon }}</span>
      <span class="nav-label">{{ page.name }}</span>
    </a>
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
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 8px 16px;
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid transparent;
  font-size: 0.9rem;
  position: relative;
}

.menu-item a::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  width: 0;
  height: 2px;
  background: #00ffcc;
  border-radius: 1px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: translateX(-50%);
  box-shadow: 0 0 8px #00ffcc, 0 0 16px rgba(0, 255, 204, 0.4);
}

.can-hover .menu-item a:hover {
  background: rgba(0, 255, 204, 0.08);
  box-shadow: 0 0 16px rgba(0, 255, 204, 0.12), inset 0 0 12px rgba(0, 255, 204, 0.03);
  transform: translateY(-1px);
  border-color: rgba(0, 255, 204, 0.2);
}

.menu-item a.active {
  background: rgba(0, 255, 204, 0.08);
  border-color: rgba(0, 255, 204, 0.25);
  box-shadow: 0 0 8px rgba(0, 255, 204, 0.08);
  color: #ffffff;
  text-shadow: 0 0 8px rgba(0, 255, 204, 0.5);
}

.menu-item a.active::after {
  width: 60%;
}

.nav-icon {
  font-size: 1rem;
  line-height: 1;
}

.nav-label {
  letter-spacing: 0.02em;
}

@media (max-width: 600px) {
  .menu-item {
    margin: 5px 0;
  }
  .menu-item a {
    padding: 8px 12px;
  }
  .nav-icon {
    font-size: 0.9rem;
  }
}
</style>
