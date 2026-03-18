<template>
  <div id="os-environment" :class="{ 'game-active': gameMode }">
    <!-- Desktop Background (3D City) -->
    <CyberpunkCity
      v-if="isClient"
      :showSplash="showSplash"
      ref="cyberpunkCityRef"
      @game-start="gameMode = true"
      @game-end="gameMode = false"
    />

    <!-- Window Manager Layer -->
    <div id="desktop-layer" v-show="!gameMode && !showSplash">
      <WindowComponent
        v-for="win in windows"
        :key="win.id"
        :id="win.id"
        :title="win.title"
        :component="win.component"
        :props="win.props"
        :initialX="win.x"
        :initialY="win.y"
        :initialWidth="win.width"
        :initialHeight="win.height"
        :zIndex="win.zIndex"
        :isMinimized="win.isMinimized"
        :isMaximized="win.isMaximized"
        :isFullScreen="win.isFullScreen || false"
      />
    </div>

    <!-- OS Taskbar -->
    <Taskbar v-show="!gameMode && !showSplash" />

    <Transition name="glitch-fade">
      <SplashScreen v-if="showSplash" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineAsyncComponent, onErrorCaptured } from "vue";
import SplashScreen from "./components/SplashScreen.vue";
import WindowComponent from "./components/WindowComponent.vue";
import Taskbar from "./components/Taskbar.vue";
import { useWindowManager } from "./composables/useWindowManager";

// Import pages for default windows
import PageContent from "./components/PageContent.vue";

const CyberpunkCity = defineAsyncComponent(() => {
  if (import.meta.env.SSR) {
    return Promise.resolve({ render: () => null });
  }
  return import("./components/CyberpunkCity.vue");
});

const { state, openWindow } = useWindowManager();
const windows = state.windows;

const showSplash = ref(true);
const gameMode = ref(false);
const isClient = ref(false);
const cyberpunkCityRef = ref<any>(null);

let splashTimeout: ReturnType<typeof setTimeout>;

onMounted(() => {
  isClient.value = true;
  splashTimeout = setTimeout(() => {
    showSplash.value = false;
    // Open home page window by default
    openWindow("Home", PageContent, { name: 'home' }, { width: 600, height: 450, x: 100, y: 100 });
  }, 500);

  // Expose global methods for game modes
  (window as any).startExploration = () => {
     if (cyberpunkCityRef.value && cyberpunkCityRef.value.startExplorationMode) {
        cyberpunkCityRef.value.startExplorationMode();
     }
  };
  (window as any).startFlyingTour = () => {
     if (cyberpunkCityRef.value && cyberpunkCityRef.value.startFlyingTour) {
        cyberpunkCityRef.value.startFlyingTour();
     }
  };
  (window as any).startDemoMode = () => {
     if (cyberpunkCityRef.value && cyberpunkCityRef.value.startDemoMode) {
        cyberpunkCityRef.value.startDemoMode();
     }
  };

  document.addEventListener("contextmenu", handleContextMenu);
});

const handleContextMenu = (e: Event) => {
  e.preventDefault();
};

onErrorCaptured((err) => {
  console.error("App Error Captured:", err);
  showSplash.value = false;
  return true;
});

onUnmounted(() => {
  clearTimeout(splashTimeout);
  document.removeEventListener("contextmenu", handleContextMenu);
  delete (window as any).startExploration;
  delete (window as any).startFlyingTour;
  delete (window as any).startDemoMode;
});

</script>

<style>
#os-environment {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

#desktop-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100vh - 40px); /* Leave space for taskbar */
  pointer-events: none; /* Let clicks pass through empty desktop space */
}

#desktop-layer > * {
  pointer-events: auto; /* Catch clicks on windows */
}

.glitch-fade-leave-active {
  animation: glitch-fade-out 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes glitch-fade-out {
  0% { opacity: 1; transform: translate(0); clip-path: inset(0 0 0 0); }
  10% { opacity: 1; transform: translate(-2px, 2px); clip-path: inset(10% 0 80% 0); }
  20% { opacity: 1; transform: translate(2px, -2px); clip-path: inset(80% 0 10% 0); }
  30% { opacity: 1; transform: translate(-2px, 2px); clip-path: inset(10% 0 80% 0); }
  40% { opacity: 1; transform: translate(2px, -2px); clip-path: inset(80% 0 10% 0); }
  50% { opacity: 1; transform: translate(-2px, 2px); clip-path: inset(10% 0 80% 0); }
  60% { opacity: 1; transform: translate(2px, -2px); clip-path: inset(80% 0 10% 0); }
  70% { opacity: 1; transform: translate(-2px, 2px); clip-path: inset(10% 0 80% 0); }
  80% { opacity: 1; transform: translate(2px, -2px); clip-path: inset(80% 0 10% 0); }
  90% { opacity: 1; transform: translate(-2px, 2px); clip-path: inset(10% 0 80% 0); }
  100% { opacity: 0; transform: translate(0); clip-path: inset(0 0 0 0); }
}
</style>