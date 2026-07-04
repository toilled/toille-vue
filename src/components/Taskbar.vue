<template>
  <div class="taskbar">
    <div class="taskbar-left">
      <button class="start-button" @click="toggleStart" title="Start">
        <span class="start-icon">◆</span>
        <span class="start-text">Start</span>
      </button>
      <div class="taskbar-divider" />
      <div class="taskbar-windows">
        <button
          v-for="w in windows"
          :key="w.id"
          class="taskbar-window"
          :class="{ active: !w.minimized && w.zIndex === maxZ }"
          @click="onWindowClick(w)"
        >
          <span v-if="w.icon" class="tw-icon">{{ w.icon }}</span>
          <span class="tw-title">{{ w.title }}</span>
        </button>
      </div>
    </div>
    <div class="taskbar-right">
      <button class="tray-button" @click="onToggleSound" :title="soundOn ? 'Mute' : 'Unmute'">
        {{ soundOn ? '🔊' : '🔇' }}
      </button>
      <span class="taskbar-clock">{{ time }}</span>
    </div>
    <StartMenu v-if="showStart" :apps="startApps" @launch="onLaunchApp" @shutdown="onShutdown" />
  </div>
</template>

<script setup lang="ts">
import type { WindowState } from '../composables/useWindowManager';
import { useWindowManager } from '../composables/useWindowManager';
import StartMenu from './StartMenu.vue';

const { windows, focusWindow, minimizeWindow } = useWindowManager();

const showStart = ref(false);
const time = ref('');

let timeInterval: ReturnType<typeof setInterval> | undefined;

defineProps<{
  soundOn: boolean;
  startApps: { id: string; name: string; icon: string }[];
}>();

const emit = defineEmits<{
  (e: 'launch', id: string): void;
  (e: 'toggle-sound'): void;
  (e: 'shutdown'): void;
}>();

const maxZ = computed(() => {
  if (windows.value.length === 0) return 0;
  return Math.max(...windows.value.map((w) => w.zIndex));
});

function toggleStart() {
  showStart.value = !showStart.value;
}

function onWindowClick(w: WindowState) {
  if (w.minimized) {
    minimizeWindow(w.id);
  } else {
    focusWindow(w.id);
  }
}

function onLaunchApp(id: string) {
  showStart.value = false;
  emit('launch', id);
}

function onShutdown() {
  showStart.value = false;
  emit('shutdown');
}

function onToggleSound() {
  emit('toggle-sound');
}

function updateTime() {
  const now = new Date();
  time.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 30_000);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (showStart.value && !target.closest('.taskbar') && !target.closest('.start-menu')) {
    showStart.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
});
</script>

<style scoped>
.taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: rgba(8, 8, 28, 0.95);
  border-top: 1px solid rgba(0, 255, 204, 0.25);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  z-index: 9998;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.taskbar-left {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.start-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: none;
  border: none;
  color: #00ffcc;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.start-button:hover {
  background: rgba(0, 255, 204, 0.1);
}

.start-icon {
  font-size: 1rem;
}

.start-text {
  font-weight: bold;
}

.taskbar-divider {
  width: 1px;
  height: 24px;
  background: rgba(0, 255, 204, 0.2);
  margin: 0 4px;
}

.taskbar-windows {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.taskbar-windows::-webkit-scrollbar {
  display: none;
}

.taskbar-window {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  border-radius: 4px;
  color: #aaa;
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  font-family: var(--font-family);
}

.taskbar-window:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.taskbar-window.active {
  background: rgba(0, 255, 204, 0.15);
  border-color: rgba(0, 255, 204, 0.3);
  color: #00ffcc;
}

.tw-icon {
  font-size: 0.85rem;
}

.tw-title {
  overflow: hidden;
  text-overflow: ellipsis;
}

.taskbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.tray-button {
  background: none;
  border: none;
  color: #aaa;
  font-size: 0.85rem;
  padding: 4px 6px;
  cursor: pointer;
  border-radius: 4px;
  line-height: 1;
}

.tray-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.taskbar-clock {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: #888;
  padding: 0 8px;
  user-select: none;
}
</style>
