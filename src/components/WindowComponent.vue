<template>
  <div
    class="window"
    :class="{
      'minimized': isMinimized,
      'maximized': isMaximized,
      'active': isActive,
      'fullscreen': isFullScreen
    }"
    :style="windowStyle"
    @mousedown="focus"
  >
    <!-- Title Bar -->
    <div
      class="title-bar"
      @mousedown="startDrag"
      @dblclick="toggleMaximize"
    >
      <div class="title-bar-text">{{ title }}</div>
      <div class="title-bar-controls">
        <button v-if="!isFullScreen" aria-label="Minimize" @click.stop="toggleMinimize">_</button>
        <button v-if="!isFullScreen" aria-label="Maximize" @click.stop="toggleMaximize">□</button>
        <button aria-label="Close" @click.stop="close">X</button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="window-body" v-show="!isMinimized">
      <component :is="component" v-bind="props" />
    </div>

    <!-- Resizers -->
    <div v-if="!isMaximized && !isFullScreen && !isMinimized" class="resizer resizer-r" @mousedown.stop="startResize('e', $event)"></div>
    <div v-if="!isMaximized && !isFullScreen && !isMinimized" class="resizer resizer-b" @mousedown.stop="startResize('s', $event)"></div>
    <div v-if="!isMaximized && !isFullScreen && !isMinimized" class="resizer resizer-br" @mousedown.stop="startResize('se', $event)"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useWindowManager } from '../composables/useWindowManager';

const props = defineProps<{
  id: string;
  title: string;
  component: any;
  props?: Record<string, any>;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFullScreen: boolean;
}>();

const { state, focusWindow, closeWindow, toggleMinimize: minimizeWin, toggleMaximize: maximizeWin, updateWindowPosition, updateWindowSize } = useWindowManager();

const isActive = computed(() => state.activeWindowId === props.id);

const currentX = ref(props.initialX);
const currentY = ref(props.initialY);
const currentW = ref(props.initialWidth);
const currentH = ref(props.initialHeight);

const windowStyle = computed(() => {
  if (props.isFullScreen) {
     return {
        zIndex: props.zIndex,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
     }
  }

  if (props.isMaximized) {
    return {
      zIndex: props.zIndex,
      top: 0,
      left: 0,
      width: '100vw',
      height: 'calc(100vh - 40px)', // Leave space for taskbar
    };
  }

  return {
    zIndex: props.zIndex,
    transform: `translate(${currentX.value}px, ${currentY.value}px)`,
    width: `${currentW.value}px`,
    height: props.isMinimized ? 'auto' : `${currentH.value}px`,
  };
});

const focus = () => focusWindow(props.id);
const close = () => closeWindow(props.id);
const toggleMinimize = () => minimizeWin(props.id);
const toggleMaximize = () => maximizeWin(props.id);

// --- Dragging Logic ---
const isDragging = ref(false);
let startX = 0, startY = 0, initialWinX = 0, initialWinY = 0;

const startDrag = (e: MouseEvent) => {
  if (props.isMaximized || props.isFullScreen) return; // Prevent drag if maximized

  isDragging.value = true;
  startX = e.clientX;
  startY = e.clientY;
  initialWinX = currentX.value;
  initialWinY = currentY.value;
  focus();

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  currentX.value = initialWinX + dx;
  currentY.value = initialWinY + dy;
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  updateWindowPosition(props.id, currentX.value, currentY.value);
};

// --- Resizing Logic ---
const isResizing = ref(false);
let resizeDir = '';
let startW = 0, startH = 0;

const startResize = (dir: string, e: MouseEvent) => {
  isResizing.value = true;
  resizeDir = dir;
  startX = e.clientX;
  startY = e.clientY;
  startW = currentW.value;
  startH = currentH.value;
  focus();

  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
};

const onResize = (e: MouseEvent) => {
  if (!isResizing.value) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  if (resizeDir.includes('e')) {
    currentW.value = Math.max(200, startW + dx);
  }
  if (resizeDir.includes('s')) {
    currentH.value = Math.max(100, startH + dy);
  }
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
  updateWindowSize(props.id, currentW.value, currentH.value);
};

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
});

</script>

<style scoped>
.window {
  position: absolute;
  background-color: var(--pico-card-background-color);
  border: 1px solid var(--pico-border-color);
  box-shadow: 0 0 15px rgba(0, 255, 204, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* Add subtle neon glow */
  box-shadow: inset 0 0 10px rgba(0, 255, 204, 0.1), 0 0 10px rgba(0, 255, 204, 0.2);
}

.window.active {
  box-shadow: inset 0 0 15px rgba(255, 0, 204, 0.2), 0 0 20px rgba(255, 0, 204, 0.4);
  border-color: var(--pico-primary);
}

.window.minimized {
   /* Minimizing hides content, title bar remains visible but might be moved by OS taskbar logic later */
   height: auto !important;
   display: none; /* In a real OS, minimized windows are hidden and only in taskbar */
}

.window.fullscreen {
  border: none;
  box-shadow: none;
  background: black; /* Or transparent depending on the game */
}

.title-bar {
  background-color: rgba(20, 20, 40, 0.9);
  color: var(--pico-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  cursor: grab;
  border-bottom: 1px solid var(--pico-border-color);
  user-select: none;
}

.title-bar:active {
  cursor: grabbing;
}

.active .title-bar {
   background-color: rgba(40, 20, 40, 0.9);
   border-bottom-color: var(--pico-primary);
}

.title-bar-text {
  font-weight: bold;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.title-bar-controls button {
  background: transparent;
  border: 1px solid transparent;
  color: var(--pico-color);
  margin-left: 5px;
  padding: 0px 5px;
  cursor: pointer;
  font-family: monospace;
  font-size: 1rem;
  line-height: 1;
}

.title-bar-controls button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--pico-color);
}
.title-bar-controls button:last-child:hover {
  background: rgba(255, 0, 0, 0.5); /* Red for close */
  border-color: red;
  color: white;
}


.window-body {
  flex-grow: 1;
  overflow: auto;
  padding: 10px;
  background-color: rgba(5, 5, 16, 0.85); /* Slightly transparent */
  backdrop-filter: blur(5px);
}

/* Scrollbar for window body */
.window-body::-webkit-scrollbar {
  width: 8px;
}
.window-body::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.5);
}
.window-body::-webkit-scrollbar-thumb {
  background: var(--pico-primary);
}


/* Resizers */
.resizer {
  position: absolute;
}
.resizer-r {
  right: 0;
  top: 0;
  width: 5px;
  height: 100%;
  cursor: e-resize;
}
.resizer-b {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  cursor: s-resize;
}
.resizer-br {
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  cursor: se-resize;
  z-index: 10;
}
</style>