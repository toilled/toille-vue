<template>
  <div class="nav-wrapper">
    <ul class="nav-links">
      <MenuItem v-for="page in pages" :key="page.link" :page="page" />
    </ul>
    <div class="tools-toggle-wrapper">
      <button
        class="tools-toggle"
        @click="handleToolsToggle"
        :class="{ expanded: showTools }"
        :aria-label="t('menu.toggleTools')"
        :aria-expanded="showTools"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="toggle-icon"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <line x1="12" y1="5" x2="12" y2="19" />
        </svg>
      </button>
    </div>
    <div class="nav-tools" :class="{ show: showTools }">
      <button
        @click="$emit('explore')"
        class="icon-wrapper"
        :class="{ disabled: !cityOn || cityFallback }"
        :aria-label="t('menu.exploreCity')"
        data-label="Explore"
      >
        <img src="/person-icon.svg" :alt="t('menu.exploreCity')" class="icon" />
      </button>

      <button
        @click="$emit('demo')"
        class="icon-wrapper"
        :class="{ disabled: !cityOn || cityFallback }"
        :aria-label="t('menu.demo')"
        data-label="Demo"
      >
        <img src="/64k-icon.svg" :alt="t('menu.demo')" class="icon" />
      </button>
      <button
        @click="toggleSound"
        class="icon-wrapper"
        :aria-label="t('menu.toggleSound')"
        data-label="Sound"
      >
        <img v-if="soundOn" src="/sound-icon.svg" :alt="t('menu.toggleSound')" class="icon" />
        <img v-else src="/mute-icon.svg" :alt="t('menu.toggleSound')" class="icon" />
      </button>
      <button
        @click="$emit('toggle-content')"
        class="icon-wrapper"
        :aria-label="t('menu.toggleVisibility')"
        data-label="View"
      >
        <svg
          v-if="contentVisible"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#000000"
          class="icon"
        >
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
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
      </button>
      <button
        @click="toggleCityBackground"
        class="icon-wrapper"
        :aria-label="t('menu.toggleCity')"
        data-label="City"
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
      </button>
      <button
        class="icon-wrapper terminal-icon"
        @click="$emit('toggle-terminal')"
        :aria-label="t('menu.openTerminal')"
        data-label="Terminal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000000"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon"
        >
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      </button>
      <button
        class="icon-wrapper"
        @click="$emit('toggle-desktop')"
        :aria-label="t('desktop.toggleDesktop')"
        data-label="Desktop"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000000"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </button>
      <button
        class="icon-wrapper"
        :aria-label="t('menu.weather')"
        data-label="Weather"
        @click="weatherRef?.toggleModal()"
      >
        <WeatherIcon ref="weatherRef" />
      </button>
      <button
        class="icon-wrapper"
        :aria-label="t('menu.language')"
        data-label="Lang"
        @click.stop="langRef?.toggle()"
      >
        <LanguageSelector ref="langRef" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Page } from '../interfaces/Page';
import { cyberpunkAudio } from '../utils/CyberpunkAudio';
import { audioManager } from '../utils/AudioManager';
import { cityBackground } from '../utils/CityBackgroundManager';
import { useEpilepsyWarning } from '../composables/useEpilepsyWarning';
import LanguageSelector from './LanguageSelector.vue';

const { t } = useI18n();
const { confirm: epilepsyConfirm } = useEpilepsyWarning();

defineProps<{
  pages: Page[];
  contentVisible: boolean;
  cityFallback: boolean;
}>();

defineEmits<{
  (e: 'explore'): void;
  (e: 'toggle-content'): void;
  (e: 'demo'): void;
  (e: 'toggle-terminal'): void;
  (e: 'toggle-desktop'): void;
}>();

const showTools = ref(false);
const weatherRef = ref<{ toggleModal: () => void } | null>(null);
const langRef = ref<{ toggle: () => void } | null>(null);

function handleToolsToggle() {
  showTools.value = !showTools.value;
}

const soundOn = computed(() => audioManager.isSoundEnabled.value);
const cityOn = computed(() => cityBackground.isEnabled.value);

const toggleSound = async () => {
  if (!audioManager.isSoundEnabled.value && !audioManager.photosensitivityConfirmed) {
    const ok = await epilepsyConfirm(t('epilepsy.warning'));
    if (!ok) return;
    audioManager.photosensitivityConfirmed = true;
  }
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

.tools-toggle-wrapper {
  position: relative;
  display: flex;
  align-items: center;
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
  border-left: 1px solid rgba(0, 255, 204, 0.25);
}

.tools-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid rgba(0, 255, 204, 0.3);
  border-radius: 6px;
  cursor: pointer;
  padding: 0.3rem;
  margin-left: auto;
  color: #00ffcc;
  transition: all 0.2s ease;
}

.can-hover .tools-toggle:hover {
  background: rgba(0, 255, 204, 0.1);
  border-color: rgba(0, 255, 204, 0.5);
  box-shadow: 0 0 12px rgba(0, 255, 204, 0.2);
}

.toggle-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  background: none;
  border: none;
  font: inherit;
  color: inherit;
  margin: 0;
  appearance: none;
  -webkit-appearance: none;
}

.can-hover .icon-wrapper:hover {
  background: rgba(0, 255, 204, 0.1);
  box-shadow:
    0 0 12px rgba(0, 255, 204, 0.2),
    inset 0 0 8px rgba(0, 255, 204, 0.05);
}

.icon-wrapper:active {
  transform: scale(0.92);
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
    gap: 0.4rem;
    justify-content: center;
    width: 100%;
  }
  .nav-links {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    flex-wrap: nowrap;
    justify-content: center;
    flex: 1;
    gap: 0.1rem;
    padding-bottom: 2px;
  }
  .nav-links::-webkit-scrollbar {
    display: none;
  }
  .tools-toggle {
    display: flex;
    flex-shrink: 0;
  }
  .nav-tools {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    margin-left: 0;
    padding: 0;
    border-left: none;
    border-top: none;
    gap: 0.2rem;
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition:
      max-height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
      opacity 0.25s ease,
      padding 0.3s ease;
    pointer-events: none;
  }
  .nav-tools.show {
    max-height: 60px;
    opacity: 1;
    padding: 0.5rem 0 0.25rem;
    border-top: 1px solid rgba(0, 255, 204, 0.15);
    pointer-events: auto;
  }
  .icon-wrapper {
    padding: 0.25rem;
  }
  .icon-wrapper.terminal-icon {
    display: none;
  }
  .icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 400px) {
  .nav-links {
    gap: 0.05rem;
  }
  .nav-tools {
    gap: 0.1rem;
  }
  .icon {
    width: 18px;
    height: 18px;
  }
}

@media (min-width: 1024px) and (orientation: landscape) and (hover: hover) and (pointer: fine) {
  .nav-wrapper {
    flex: 1;
    flex-direction: column;
    align-items: stretch;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
    gap: 0.1rem;
  }

  .tools-toggle {
    display: none;
  }

  .nav-tools {
    margin-top: auto;
    margin-left: 0;
    padding: 0.75rem 16px 0;
    border-left: none;
    border-top: 1px solid rgba(0, 255, 204, 0.15);
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.15rem;
    overflow-x: hidden;
  }

  .nav-tools > .icon-wrapper {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.4rem;
    justify-content: flex-start;
    border-radius: 4px;
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
  }

  .nav-tools > .icon-wrapper::after {
    content: attr(data-label);
    font-size: 0.78rem;
    opacity: 0.85;
    white-space: nowrap;
  }
}
</style>
