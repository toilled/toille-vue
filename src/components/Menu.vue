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
          data-testid="sound-on-icon"
        />
        <img
          v-else
          src="/mute-icon.svg"
          alt="Toggle sound"
          class="icon"
          data-testid="sound-off-icon"
        />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
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
  localStorage.setItem('cyberpunk_sound_enabled', String(soundOn.value));

  if (soundOn.value) {
    audio.play();
  } else {
    audio.pause();
  }
};

onMounted(() => {
  const storedSound = localStorage.getItem('cyberpunk_sound_enabled');
  if (storedSound === 'true') {
    soundOn.value = true;
    if (!audio) {
      audio = new CyberpunkAudio();
    }
    audio.play();

    // Browser Autoplay Policy fix:
    // If context starts suspended (no user gesture yet), we need to resume it on first interaction.
    // audio.play() calls ctx.resume(), but it might fail or return a pending promise.
    // We attach a one-time listener to ensure resumption.
    const resumeAudio = () => {
      if (audio) {
        audio.play(); // This triggers ctx.resume()
      }
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
    };

    document.addEventListener('click', resumeAudio);
    document.addEventListener('keydown', resumeAudio);
  }
});
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
