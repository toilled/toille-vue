<template>
  <div class="taskbar">
    <div class="start-button" @click="toggleStartMenu">
      SYS
    </div>

    <div class="taskbar-tasks">
      <div
        v-for="win in windows"
        :key="win.id"
        class="task-item"
        :class="{ 'active': win.id === activeWindowId }"
        @click="focusOrRestore(win)"
      >
        {{ win.title }}
      </div>
    </div>

    <div class="taskbar-clock">
      {{ time }}
    </div>

    <!-- Start Menu overlay -->
    <div v-if="startMenuOpen" class="start-menu" @click.stop>
      <ul>
        <li v-for="page in pages" :key="page.link" @click="launchApp(page)">
           <span class="icon">{{ page.icon || '📄' }}</span> {{ page.title || page.name }}
        </li>
        <hr>
        <li @click="launchCityExplore">
           <span class="icon">🚶</span> Explore City
        </li>
        <li @click="launchCityFly">
           <span class="icon">✈️</span> Fly Tour
        </li>
        <li @click="launchCityDemo">
           <span class="icon">🎬</span> 64k Demo
        </li>
        <hr>
        <li @click="launchGames">
           <span class="icon">🕹️</span> Games
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useWindowManager, WindowState } from '../composables/useWindowManager';
import pagesData from '../configs/pages.json';
import PageContent from './PageContent.vue';

// Filter out hidden pages for main menu, or just show all
const pages = pagesData.filter(p => !p.hidden);

const { state, focusWindow, toggleMinimize, openWindow } = useWindowManager();
const windows = state.windows;
const activeWindowId = ref(state.activeWindowId);

// Sync local active id
import { watch } from 'vue';
watch(() => state.activeWindowId, (newId) => {
  activeWindowId.value = newId;
});

const startMenuOpen = ref(false);
const toggleStartMenu = () => {
  startMenuOpen.value = !startMenuOpen.value;
};

// Close start menu when clicking outside
const closeStartMenu = () => {
  startMenuOpen.value = false;
};

onMounted(() => {
  document.addEventListener('click', closeStartMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeStartMenu);
});

const launchApp = (page: any) => {
  // Pass the page name param required by PageContent
  openWindow(page.title || page.name, PageContent, { name: page.link.replace('/', '') || 'home' });
  startMenuOpen.value = false;
};

const launchGames = () => {
   openWindow("Games Folder", PageContent, { name: 'hidden' });
   startMenuOpen.value = false;
};

const launchCityExplore = () => {
  if ((window as any).startExploration) {
    (window as any).startExploration();
  }
  startMenuOpen.value = false;
};

const launchCityFly = () => {
  if ((window as any).startFlyingTour) {
    (window as any).startFlyingTour();
  }
  startMenuOpen.value = false;
};

const launchCityDemo = () => {
  if ((window as any).startDemoMode) {
    (window as any).startDemoMode();
  }
  startMenuOpen.value = false;
};

const focusOrRestore = (win: WindowState) => {
  if (win.isMinimized) {
    toggleMinimize(win.id);
  } else if (activeWindowId.value === win.id) {
    toggleMinimize(win.id);
  } else {
    focusWindow(win.id);
  }
};

const time = ref('');
const updateTime = () => {
  const now = new Date();
  time.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
let timerId: any;
onMounted(() => {
  updateTime();
  timerId = setInterval(updateTime, 1000);
});
onUnmounted(() => clearInterval(timerId));
</script>

<style scoped>
.taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background-color: rgba(10, 10, 20, 0.95);
  border-top: 1px solid var(--pico-primary);
  display: flex;
  align-items: center;
  z-index: 10000; /* Always on top of windows */
  padding: 0 10px;
  box-shadow: 0 -2px 10px rgba(0, 255, 204, 0.2);
}

.start-button {
  background-color: var(--pico-primary);
  color: var(--pico-background-color);
  font-weight: bold;
  padding: 5px 15px;
  cursor: pointer;
  border-radius: 2px;
  margin-right: 15px;
  box-shadow: 0 0 5px var(--pico-primary);
  transition: all 0.2s;
}

.start-button:hover {
  background-color: var(--pico-primary-hover);
  box-shadow: 0 0 10px var(--pico-primary);
}

.taskbar-tasks {
  flex-grow: 1;
  display: flex;
  gap: 5px;
  overflow-x: auto;
}

.taskbar-tasks::-webkit-scrollbar {
  display: none;
}

.task-item {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--pico-muted-border-color);
  color: var(--pico-color);
  padding: 5px 10px;
  cursor: pointer;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85rem;
}

.task-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.task-item.active {
  background-color: rgba(0, 255, 204, 0.2);
  border-color: var(--pico-border-color);
  box-shadow: inset 0 0 5px var(--pico-border-color);
}

.taskbar-clock {
  color: var(--pico-color);
  font-family: monospace;
  padding-left: 15px;
  border-left: 1px solid var(--pico-muted-border-color);
}

.start-menu {
  position: absolute;
  bottom: 40px;
  left: 0;
  width: 250px;
  background-color: rgba(10, 10, 20, 0.95);
  border: 1px solid var(--pico-primary);
  border-bottom: none;
  box-shadow: 2px -2px 10px rgba(0, 255, 204, 0.2);
  padding: 10px 0;
}

.start-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.start-menu li {
  padding: 10px 20px;
  cursor: pointer;
  color: var(--pico-color);
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.start-menu li:hover {
  background-color: var(--pico-primary);
  color: var(--pico-background-color);
}

.start-menu hr {
  border-color: rgba(255, 255, 255, 0.1);
  margin: 5px 0;
}

.icon {
  margin-right: 10px;
  font-size: 1.2rem;
}
</style>