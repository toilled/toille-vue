<template>
  <div class="desktop-overlay" @click.self="onDesktopClick">
    <div class="desktop-wallpaper">
      <div class="wallpaper-grid" />
      <div class="wallpaper-glow" />
      <div class="wallpaper-text">TOILLE OS</div>
    </div>

    <div class="desktop-icons">
      <DesktopShortcut
        v-for="shortcut in shortcuts"
        :key="shortcut.id"
        :label="shortcut.label"
        :icon="shortcut.icon"
        :is-selected="selectedShortcut === shortcut.id"
        @open="onShortcutOpen(shortcut.id)"
        @select="selectedShortcut = shortcut.id"
      />
    </div>

    <DesktopWindow
      v-for="w in windows"
      :key="w.id"
      :win="w"
      :component="componentMap[w.component]"
      @close="closeWindow(w.id)"
      @minimize="minimizeWindow(w.id)"
      @maximize="maximizeWindow(w.id)"
      @focus="focusWindow(w.id)"
      @move="(x, y) => moveWindow(w.id, x, y)"
      @resize="(w_, h) => resizeWindow(w.id, w_, h)"
    />

    <Taskbar
      :sound-on="soundOn"
      :start-apps="startApps"
      @launch="onLaunchApp"
      @toggle-sound="onToggleSound"
      @shutdown="onShutdown"
    />
  </div>
</template>

<script setup lang="ts">
import { useWindowManager } from '../composables/useWindowManager';
import { audioManager } from '../utils/AudioManager';
import { cyberpunkAudio } from '../utils/CyberpunkAudio';
import type { Component } from 'vue';
import DesktopWindow from './DesktopWindow.vue';
import Taskbar from './Taskbar.vue';
import DesktopShortcut from './DesktopShortcut.vue';

const emit = defineEmits<{
  (e: 'shutdown'): void;
}>();

const {
  windows,
  openWindow,
  closeWindow,
  minimizeWindow,
  maximizeWindow,
  focusWindow,
  moveWindow,
  resizeWindow,
} = useWindowManager();

const desktopRunner =
  inject<Ref<((component: string, title: string) => void) | null>>('desktopRunner');
if (desktopRunner) {
  desktopRunner.value = (component: string, title: string) => {
    openWindow({ title, component, width: 700, height: 500 });
  };
}
provide('desktopCloseWindow', (id: string) => closeWindow(id));
const selectedShortcut = ref<string | null>(null);
const soundOn = computed(() => audioManager.isSoundEnabled.value);

interface Shortcut {
  id: string;
  label: string;
  icon: string;
  component?: string;
  props?: Record<string, unknown>;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
}

const componentMap: Record<string, Component> = {
  Terminal: defineAsyncComponent(() => import('./Terminal.vue')),
  Checker: defineAsyncComponent(() => import('./Checker.vue')),
  NoughtsAndCrosses: defineAsyncComponent(() => import('./NoughtsAndCrosses.vue')),
  Quiz: defineAsyncComponent(() => import('./Quiz.vue')),
  Ask: defineAsyncComponent(() => import('./Ask.vue')),
  Activity: defineAsyncComponent(() => import('./Activity.vue')),
  Suggestion: defineAsyncComponent(() => import('./Suggestion.vue')),
  DesktopFileExplorer: defineAsyncComponent(() => import('./DesktopFileExplorer.vue')),
};

const shortcuts: Shortcut[] = [
  {
    id: 'terminal',
    label: 'Terminal',
    icon: '⬛',
    component: 'Terminal',
    props: { overlay: false },
    width: 700,
    height: 500,
    minWidth: 320,
    minHeight: 240,
  },
  {
    id: 'explorer',
    label: 'File Explorer',
    icon: '📁',
    component: 'DesktopFileExplorer',
    width: 400,
    height: 320,
    minWidth: 240,
    minHeight: 280,
  },
  {
    id: 'checker',
    label: 'Checker',
    icon: '🍺',
    component: 'Checker',
    width: 440,
    height: 300,
    minWidth: 420,
    minHeight: 280,
  },
  {
    id: 'noughts',
    label: 'Tic-Tac-Toe',
    icon: '❌',
    component: 'NoughtsAndCrosses',
    width: 430,
    height: 600,
    minWidth: 410,
    minHeight: 570,
  },
  {
    id: 'quiz',
    label: 'Quiz',
    icon: '❓',
    component: 'Quiz',
    width: 380,
    height: 480,
    minWidth: 360,
    minHeight: 450,
  },
  {
    id: 'ask',
    label: 'Ask Me',
    icon: '💬',
    component: 'Ask',
    width: 350,
    height: 580,
    minWidth: 320,
    minHeight: 560,
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: '🎯',
    component: 'Activity',
    width: 320,
    height: 220,
    minWidth: 280,
    minHeight: 180,
  },
  {
    id: 'jokes',
    label: 'Dad Jokes',
    icon: '😂',
    component: 'Suggestion',
    width: 320,
    height: 220,
    minWidth: 280,
    minHeight: 180,
    props: { url: 'https://icanhazdadjoke.com/', valueName: 'joke', title: 'Have a laugh!' },
  },
];

const startApps = shortcuts.map((s) => ({
  id: s.id,
  name: s.label,
  icon: s.icon,
}));

function onShortcutOpen(id: string) {
  const sc = shortcuts.find((s) => s.id === id);
  if (!sc) return;
  const opts: {
    title: string;
    component: string;
    icon: string;
    props?: Record<string, unknown>;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
  } = {
    title: sc.label,
    icon: sc.icon,
    component: sc.component ?? '',
  };
  if (sc.props) opts.props = sc.props;
  if (sc.width) opts.width = sc.width;
  if (sc.height) opts.height = sc.height;
  if (sc.minWidth) opts.minWidth = sc.minWidth;
  if (sc.minHeight) opts.minHeight = sc.minHeight;
  openWindow(opts);
}

function onLaunchApp(id: string) {
  onShortcutOpen(id);
}

function onToggleSound() {
  audioManager.toggleSound();
  if (audioManager.isSoundEnabled.value) {
    cyberpunkAudio.play();
  } else {
    cyberpunkAudio.pause();
  }
}

function onShutdown() {
  emit('shutdown');
}

function onDesktopClick() {
  selectedShortcut.value = null;
}
</script>

<style scoped>
.desktop-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  flex-direction: column;
  background: #050510;
  overflow: hidden;
}

.desktop-wallpaper {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.wallpaper-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 255, 204, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 204, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

.wallpaper-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(0, 255, 204, 0.05) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 100%, rgba(255, 0, 204, 0.03) 0%, transparent 50%);
}

.wallpaper-text {
  position: absolute;
  bottom: 60px;
  right: 30px;
  font-family: var(--font-mono);
  font-size: 3rem;
  font-weight: bold;
  color: rgba(0, 255, 204, 0.04);
  user-select: none;
  pointer-events: none;
  letter-spacing: 0.5em;
}

.desktop-icons {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px;
  align-content: flex-start;
  flex: 1;
  padding-bottom: 44px;
}
</style>
