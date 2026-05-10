<template>
  <div class="nav-wrapper">
    <ul class="nav-links">
      <MenuItem v-for="page in pages" :key="page.link" :page="page" />
    </ul>
    <button
      class="tools-toggle"
      @click="showTools = !showTools"
      :class="{ expanded: showTools }"
      aria-label="Toggle tools"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toggle-icon">
        <line x1="5" y1="12" x2="19" y2="12" />
        <line x1="12" y1="5" x2="12" y2="19" />
      </svg>
    </button>
    <div class="nav-tools" :class="{ show: showTools }">
      <div
        @click="$emit('explore')"
        class="icon-wrapper"
        :class="{ disabled: !cityOn }"
        title="Explore City"
      >
        <img src="/person-icon.svg" alt="Explore City" class="icon" />
      </div>
      <div
        @click="$emit('fly')"
        class="icon-wrapper"
        :class="{ disabled: !cityOn }"
        title="Fly Tour"
      >
        <img src="/plane-icon.svg" alt="Fly Tour" class="icon" />
      </div>
      <div
        @click="$emit('demo')"
        class="icon-wrapper"
        :class="{ disabled: !cityOn }"
        title="64k Demo"
      >
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
      <div
        @click="$emit('toggle-content')"
        class="icon-wrapper"
        title="Toggle Visibility"
      >
        <svg
          v-if="contentVisible"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#000000"
          class="icon"
        >
          <path
            d="M12 15a3 3 0 100-6 3 3 0 000 6z"
          />
          <path
            fill-rule="evenodd"
            d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#000000"
          class="icon"
        >
          <path
            d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z"
          />
          <path
            d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.244 4.243z"
          />
          <path
            d="M6.75 12c0-.619.107-1.215.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z"
          />
        </svg>
      </div>
      <div
        @click="toggleCityBackground"
        class="icon-wrapper"
        title="Toggle City Background"
      >
        <svg
          v-if="cityOn"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000000"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon"
        >
          <circle cx="18" cy="5" r="2" />
          <path d="M2 22l5-8 4 5 4-7 5 10" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000000"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon"
        >
          <circle cx="18" cy="5" r="2" />
          <path d="M2 22l5-8 4 5 4-7 5 10" />
          <line x1="3" y1="3" x2="21" y2="21" />
        </svg>
      </div>
      <div class="icon-wrapper">
        <WeatherIcon />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import MenuItem from "./MenuItem.vue";
import WeatherIcon from "./WeatherIcon.vue";
import { Page } from "../interfaces/Page";
import { cyberpunkAudio } from "../utils/CyberpunkAudio";
import { audioManager } from "../utils/AudioManager";
import { cityBackground } from "../utils/CityBackgroundManager";

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

const showTools = ref(false);

const soundOn = computed(() => audioManager.isSoundEnabled.value);
const cityOn = computed(() => cityBackground.isEnabled.value);

const toggleSound = () => {
  audioManager.toggleSound();
  if (audioManager.isSoundEnabled.value) {
    cyberpunkAudio.play();
  } else {
    cyberpunkAudio.pause();
  }
};

const toggleCityBackground = () => {
  cityBackground.toggle();
};
</script>

<style scoped>
.nav-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-tools {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  padding-left: 0.75rem;
  border-left: 1px solid var(--pico-border-color, #00ffcc);
  opacity: 0.8;
}

.tools-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--pico-border-color, #00ffcc);
  border-radius: 4px;
  cursor: pointer;
  padding: 0.25rem;
  margin-left: auto;
  color: #00ffcc;
  transition: all 0.2s ease;
}

.can-hover .tools-toggle:hover {
  background: rgba(0, 255, 204, 0.1);
  box-shadow: 0 0 8px rgba(0, 255, 204, 0.3);
}

.toggle-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.tools-toggle.expanded .toggle-icon {
  transform: rotate(45deg);
}

.icon-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.can-hover .icon-wrapper:hover {
  background: rgba(0, 255, 204, 0.1);
  box-shadow: 0 0 8px rgba(0, 255, 204, 0.3);
}

.icon-wrapper.disabled {
  opacity: 0.2;
  cursor: default;
  pointer-events: none;
}

.icon {
  width: 24px;
  height: 24px;
  filter: invert(1);
}

@media (max-width: 768px) {
  .nav-wrapper {
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
  .nav-links {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    flex-wrap: nowrap;
    justify-content: flex-start;
    flex: 1;
    gap: 0.15rem;
  }
  .nav-links::-webkit-scrollbar {
    display: none;
  }
  .tools-toggle {
    display: flex;
  }
  .nav-tools {
    display: none;
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    gap: 0.25rem;
  }
  .nav-tools.show {
    display: flex;
  }
  .icon-wrapper {
    padding: 0.2rem;
  }
  .icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 400px) {
  .nav-links {
    flex-wrap: nowrap;
    gap: 0.1rem;
  }
  .nav-tools {
    gap: 0.15rem;
  }
  .icon {
    width: 18px;
    height: 18px;
  }
}
</style>
