<template>
  <Transition name="fade">
    <div v-if="visible" id="signal-finder">
      <div id="signal-label">SIGNAL DETECTED</div>
      <div id="signal-bars">
        <div
          v-for="i in 5"
          :key="i"
          class="signal-bar"
          :class="{ active: signalStrength > i * 0.2 }"
        ></div>
      </div>
      <div id="signal-strength">{{ Math.round(signalStrength * 100) }}%</div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  signalStrength: number;
}>();
</script>

<style scoped>
#signal-finder {
  position: fixed;
  top: 16px;
  right: 210px;
  z-index: 16;
  background: rgba(5, 5, 20, 0.85);
  border: 1px solid rgba(255, 0, 204, 0.25);
  padding: 8px 12px;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

#signal-label {
  font-family: 'Courier New', Courier, monospace;
  font-size: 9px;
  color: #ff00cc;
  letter-spacing: 2px;
  text-shadow: 0 0 6px rgba(255, 0, 204, 0.3);
}

#signal-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 16px;
}

.signal-bar {
  width: 4px;
  background: rgba(255, 0, 204, 0.15);
  transition: all 0.3s ease;
}

.signal-bar:nth-child(1) {
  height: 4px;
}
.signal-bar:nth-child(2) {
  height: 7px;
}
.signal-bar:nth-child(3) {
  height: 10px;
}
.signal-bar:nth-child(4) {
  height: 13px;
}
.signal-bar:nth-child(5) {
  height: 16px;
}

.signal-bar.active {
  background: #ff00cc;
  box-shadow: 0 0 6px #ff00cc;
}

#signal-strength {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  color: rgba(255, 0, 204, 0.7);
  min-width: 28px;
  text-align: right;
}
</style>
