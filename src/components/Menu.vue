<template>
  <ul>
    <MenuItem v-for="page in pages" :key="page.link" :page="page" />
    <li class="icons-container">
      <div @click="$emit('explore')" class="icon-wrapper" title="Explore City">
        <img src="/person-icon.svg" alt="Explore City" class="icon" />
      </div>
      <div @click="$emit('fly')" class="icon-wrapper" title="Fly Tour">
        <img src="/plane-icon.svg" alt="Fly Tour" class="icon" />
      </div>
      <div @click="$emit('demo')" class="icon-wrapper" title="64k Demo">
        <img src="/64k-icon.svg" alt="64k Demo" class="icon" />
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
      <div @click="$emit('toggle-content')" class="icon-wrapper" title="Toggle Visibility">
         <svg v-if="contentVisible" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" class="icon">
           <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
           <path fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clip-rule="evenodd" />
         </svg>
         <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" class="icon">
           <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
           <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.244 4.243z" />
           <path d="M6.75 12c0-.619.107-1.215.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
         </svg>
      </div>
      <WeatherIcon class="icon" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MenuItem from "./MenuItem.vue";
import WeatherIcon from "./WeatherIcon.vue";
import { Page } from "../interfaces/Page";
import { cyberpunkAudio } from "../utils/CyberpunkAudio";

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
  contentVisible: boolean;
}>();

const emit = defineEmits<{
  (e: "explore"): void;
  (e: "fly"): void;
  (e: "toggle-content"): void;
  (e: "demo"): void;
}>();

const soundOn = ref(false);

const toggleSound = () => {
  soundOn.value = !soundOn.value;
  if (soundOn.value) {
    cyberpunkAudio.play();
  } else {
    cyberpunkAudio.pause();
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
