<template>
  <div class="start-menu" @click.stop>
    <div class="start-header">TOILLE OS</div>
    <div class="start-body">
      <button v-for="app in apps" :key="app.id" class="start-app" @click="onLaunch(app.id)">
        <span class="app-icon">{{ app.icon }}</span>
        <span class="app-name">{{ app.name }}</span>
      </button>
    </div>
    <div class="start-footer">
      <button class="start-shutdown" @click="onShutdown">⏻ Shut Down</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface StartApp {
  id: string;
  name: string;
  icon: string;
}

defineProps<{
  apps: StartApp[];
}>();

const emit = defineEmits<{
  (e: 'launch', id: string): void;
  (e: 'shutdown'): void;
}>();

function onLaunch(id: string) {
  emit('launch', id);
}

function onShutdown() {
  emit('shutdown');
}
</script>

<style scoped>
.start-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 260px;
  background: rgba(10, 10, 35, 0.97);
  border: 1px solid rgba(0, 255, 204, 0.3);
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  z-index: 9999;
}

.start-header {
  padding: 0.75rem 1rem;
  font-family: var(--font-mono);
  font-weight: bold;
  color: #00ffcc;
  text-shadow: 0 0 10px rgba(0, 255, 204, 0.5);
  border-bottom: 1px solid rgba(0, 255, 204, 0.15);
  font-size: 0.85rem;
}

.start-body {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 300px;
  overflow-y: auto;
}

.start-app {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  color: #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  text-align: left;
  transition: all 0.15s ease;
}

.start-app:hover {
  background: rgba(0, 255, 204, 0.1);
  color: #fff;
}

.app-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.app-name {
  font-family: var(--font-family);
}

.start-footer {
  border-top: 1px solid rgba(0, 255, 204, 0.15);
  padding: 0.4rem;
}

.start-shutdown {
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: none;
  color: #ff6666;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 4px;
  text-align: left;
}

.start-shutdown:hover {
  background: rgba(255, 0, 0, 0.1);
}
</style>
