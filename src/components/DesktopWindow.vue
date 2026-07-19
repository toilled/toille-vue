<template>
  <div
    class="desktop-window"
    :class="{ maximized: win.maximized, minimized: win.minimized }"
    :style="windowStyle"
    @mousedown.prevent="onFocus"
  >
    <div
      class="window-titlebar"
      ref="titlebarRef"
      @mousedown.prevent="onDragStart"
      @dblclick="toggleMaximize"
    >
      <span class="window-icon" v-if="win.icon">{{ win.icon }}</span>
      <span class="window-title">{{ win.title }}</span>
      <div class="window-controls">
        <button class="ctrl minimize" @click.stop="onMinimize" title="Minimize">─</button>
        <button class="ctrl maximize" @click.stop="toggleMaximize" title="Maximize">□</button>
        <button class="ctrl close" @click.stop="onClose" title="Close">✕</button>
      </div>
    </div>
    <div class="window-body" ref="bodyRef">
      <component :is="props.component" v-bind="resolvedProps" />
    </div>
    <div v-if="!win.maximized" class="resize-handle" @mousedown.prevent="onResizeStart" />
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import type { WindowState } from '../composables/useWindowManager';
import { useWindowManager } from '../composables/useWindowManager';

const props = defineProps<{
  win: WindowState;
  component: Component;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'minimize'): void;
  (e: 'maximize'): void;
  (e: 'focus'): void;
  (e: 'move', x: number, y: number): void;
  (e: 'resize', w: number, h: number): void;
}>();

provide('currentWindowId', props.win.id);

const { fitContent } = useWindowManager();

const resolvedProps = computed(() => props.win.props ?? {});

const windowStyle = computed(() => {
  const w = props.win;
  if (w.minimized) {
    return { display: 'none' };
  }
  return {
    left: w.x + 'px',
    top: w.y + 'px',
    width: w.width + 'px',
    height: w.height + 'px',
    zIndex: w.zIndex,
  };
});

const titlebarRef = ref<HTMLDivElement>();
const bodyRef = ref<HTMLDivElement>();
let contentObserver: MutationObserver | null = null;

function fitToContent() {
  if (props.win.userResized || !titlebarRef.value || !bodyRef.value) return;

  const titlebarHeight = titlebarRef.value.offsetHeight;
  const body = bodyRef.value;
  const origOverflow = body.style.overflow;
  const origWidth = body.style.width;
  const origFlex = body.style.flex;
  body.style.overflow = 'visible';
  body.style.width = 'max-content';
  body.style.flex = 'none';

  const contentWidth = body.scrollWidth;
  const contentHeight = body.scrollHeight;

  body.style.overflow = origOverflow;
  body.style.width = origWidth;
  body.style.flex = origFlex;

  const width = contentWidth + 2;
  const height = titlebarHeight + contentHeight + 2;

  const maxWidth = Math.min(window.innerWidth - 20, 1000);
  const maxHeight = window.innerHeight - 60;

  const finalWidth = Math.min(Math.max(width, props.win.minWidth ?? 200), maxWidth);
  const finalHeight = Math.min(Math.max(height, props.win.minHeight ?? 120), maxHeight);

  fitContent(props.win.id, finalWidth, finalHeight);
}

onMounted(async () => {
  await nextTick();
  fitToContent();

  if (bodyRef.value) {
    contentObserver = new MutationObserver(async () => {
      await nextTick();
      fitToContent();
    });
    contentObserver.observe(bodyRef.value, { childList: true, subtree: true, characterData: true });
  }
});

onUnmounted(() => {
  contentObserver?.disconnect();
});

function onFocus() {
  emit('focus');
}

function onMinimize() {
  emit('minimize');
}

function toggleMaximize() {
  emit('maximize');
}

function onClose() {
  emit('close');
}

let dragStartX = 0;
let dragStartY = 0;
let winStartX = 0;
let winStartY = 0;

function onDragStart(e: MouseEvent) {
  emit('focus');
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  winStartX = props.win.x;
  winStartY = props.win.y;
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
}

function onDragMove(e: MouseEvent) {
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  emit('move', winStartX + dx, winStartY + dy);
}

function onDragEnd() {
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
}

let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartW = 0;
let resizeStartH = 0;

function onResizeStart(e: MouseEvent) {
  e.stopPropagation();
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = props.win.width;
  resizeStartH = props.win.height;
  document.addEventListener('mousemove', onResizeMove);
  document.addEventListener('mouseup', onResizeEnd);
}

function onResizeMove(e: MouseEvent) {
  const dw = e.clientX - resizeStartX;
  const dh = e.clientY - resizeStartY;
  emit('resize', resizeStartW + dw, resizeStartH + dh);
}

function onResizeEnd() {
  document.removeEventListener('mousemove', onResizeMove);
  document.removeEventListener('mouseup', onResizeEnd);
}
</script>

<style scoped>
.desktop-window {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: rgba(10, 10, 30, 0.95);
  border: 1px solid rgba(0, 255, 204, 0.3);
  border-radius: 8px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(0, 255, 204, 0.1);
  overflow: hidden;
  min-width: 200px;
  min-height: 120px;
}

.desktop-window.maximized {
  border-radius: 0;
  border: none;
}

.window-titlebar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: linear-gradient(90deg, rgba(0, 255, 204, 0.15), rgba(255, 0, 204, 0.1));
  border-bottom: 1px solid rgba(0, 255, 204, 0.2);
  cursor: default;
  flex-shrink: 0;
  user-select: none;
}

.window-icon {
  font-size: 1rem;
}

.window-title {
  flex: 1;
  font-size: 0.8rem;
  font-family: var(--font-mono);
  color: #00ffcc;
  text-shadow: 0 0 8px rgba(0, 255, 204, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.window-controls {
  display: flex;
  gap: 4px;
}

.ctrl {
  background: none;
  border: none;
  color: #888;
  font-size: 0.75rem;
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}

.ctrl:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.ctrl.close:hover {
  background: rgba(255, 0, 0, 0.5);
  color: #fff;
}

.window-body {
  flex: 1;
  overflow: auto;
  padding: 0.5rem;
  background: rgba(5, 5, 16, 0.9);
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, rgba(0, 255, 204, 0.3) 50%);
}
</style>
