<template>
  <div class="file-explorer">
    <div class="explorer-toolbar">
      <span class="location-bar">📁 {{ currentPath }}</span>
    </div>
    <div class="explorer-body">
      <div
        v-for="item in items"
        :key="item.name"
        class="explorer-item"
        @dblclick="onOpenItem(item)"
      >
        <span class="item-icon">{{ item.isDir ? '📁' : '📄' }}</span>
        <span class="item-name">{{ item.name }}</span>
      </div>
      <div v-if="items.length === 0" class="explorer-empty">
        <span class="empty-icon">📂</span>
        <span>This folder is empty</span>
        <span class="empty-hint">Try navigating to a different directory</span>
      </div>
    </div>
    <div class="explorer-status">{{ items.length }} item{{ items.length !== 1 ? 's' : '' }}</div>
  </div>
</template>

<script setup lang="ts">
interface FSItem {
  name: string;
  isDir: boolean;
}

const currentPath = ref('/home/user');
const items = ref<FSItem[]>([
  { name: 'Documents', isDir: true },
  { name: 'Pictures', isDir: true },
  { name: 'Music', isDir: true },
  { name: 'Projects', isDir: true },
  { name: 'notes.txt', isDir: false },
  { name: 'todo.md', isDir: false },
  { name: 'config.json', isDir: false },
]);

function onOpenItem(item: FSItem) {
  if (item.isDir) {
    currentPath.value += '/' + item.name;
    items.value = [
      { name: 'file-' + Math.random().toString(36).slice(2, 6) + '.txt', isDir: false },
      { name: 'subfolder', isDir: true },
    ];
  }
}
</script>

<style scoped>
.file-explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 0.8rem;
  color: #ccc;
}

.explorer-toolbar {
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid rgba(0, 255, 204, 0.1);
  flex-shrink: 0;
}

.location-bar {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: #00ffcc;
}

.explorer-body {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.25rem;
}

.explorer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.1s ease;
}

.can-hover .explorer-item:hover {
  background: rgba(0, 255, 204, 0.1);
}

.item-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.item-name {
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.explorer-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 0.5rem;
  opacity: 0.5;
  padding: 2rem;
}

.empty-icon {
  font-size: 2rem;
}

.empty-hint {
  font-size: 0.7rem;
  opacity: 0.6;
}

.explorer-status {
  padding: 0.3rem 0.5rem;
  border-top: 1px solid rgba(0, 255, 204, 0.1);
  font-size: 0.7rem;
  color: #666;
  flex-shrink: 0;
}
</style>
