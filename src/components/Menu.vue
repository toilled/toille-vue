<template>
  <ul>
    <MenuItem v-for="page in pages" :key="page.link" :page="page" />
    <li class="icons-container">
      <div @click="$emit('explore')" class="icon-wrapper" title="Explore City">
        <img src="/person-icon.svg" alt="Explore City" class="icon" />
      </div>
      <div @click="toggleSound" class="icon-wrapper" title="Toggle Sound">
        <img
          v-if="soundOn"
          src="/sound-icon.svg"
          alt="Toggle sound"
          class="icon"
        />
        <img
          v-else
          src="/mute-icon.svg"
          alt="Toggle sound"
          class="icon"
        />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MenuItem from "./MenuItem.vue";
import { Page } from "../interfaces/Page";
import { CyberpunkAudio } from "../utils/CyberpunkAudio";

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

const emit = defineEmits<{
  (e: "explore"): void;
}>();

const soundOn = ref(false);
let audio: CyberpunkAudio | null = null;

const toggleSound = () => {
  if (!audio) {
    audio = new CyberpunkAudio();
  }

  soundOn.value = !soundOn.value;
  if (soundOn.value) {
    audio.play();
  } else {
    audio.pause();
  }
};
</script>

<style scoped>
ul {
  position: relative;
}

.icons-container {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  gap: 10px;
  padding: 10px;
}

.icon-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 24px;
  height: 24px;
  filter: invert(1);
}
</style>
