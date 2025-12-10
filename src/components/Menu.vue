<template>
  <ul>
    <MenuItem v-for="page in pages" :key="page.link" :page="page" />
    <li @click="toggleSound" class="sound-icon-container">
      <img
        v-if="soundOn"
        src="/sound-icon.svg"
        alt="Toggle sound"
        class="sound-icon"
      />
      <img
        v-else
        src="/mute-icon.svg"
        alt="Toggle sound"
        class="sound-icon"
      />
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

.sound-icon-container {
  cursor: pointer;
  padding: 10px;
  position: absolute;
  right: 0;
  top: 0;
}

.sound-icon {
  width: 24px;
  height: 24px;
  filter: invert(1);
}

.sound-on {
}
</style>