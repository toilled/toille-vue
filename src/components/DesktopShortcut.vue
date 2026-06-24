<template>
  <div
    class="desktop-shortcut"
    :class="{ selected: isSelected }"
    @dblclick="onOpen"
    @click="onClick"
    tabindex="0"
    @keydown.enter="onOpen"
  >
    <div class="shortcut-icon">{{ icon }}</div>
    <span class="shortcut-label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  icon: string;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  (e: 'open'): void;
  (e: 'select'): void;
}>();

function onOpen() {
  emit('open');
}

function onClick() {
  emit('select');
}
</script>

<style scoped>
.desktop-shortcut {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  width: 72px;
  text-align: center;
  transition: background 0.15s ease;
  user-select: none;
}

.can-hover .desktop-shortcut:hover {
  background: rgba(0, 255, 204, 0.1);
}

.desktop-shortcut.selected {
  background: rgba(0, 255, 204, 0.15);
  outline: 1px solid rgba(0, 255, 204, 0.4);
}

.shortcut-icon {
  font-size: 2rem;
  line-height: 1;
  filter: drop-shadow(0 0 6px rgba(0, 255, 204, 0.3));
}

.shortcut-label {
  font-size: 0.7rem;
  color: #ccc;
  font-family: var(--font-mono);
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  word-break: break-word;
  line-height: 1.2;
}
</style>
