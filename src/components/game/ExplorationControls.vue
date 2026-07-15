<template>
  <div id="exploration-controls">
    <div class="control-group left">
      <div class="dpad">
        <button
          class="dpad-btn up"
          aria-label="Move Forward"
          @touchstart.prevent="controls.forward = true"
          @touchend.prevent="controls.forward = false"
        >
          W
        </button>
        <button
          class="dpad-btn left"
          aria-label="Move Left"
          @touchstart.prevent="controls.left = true"
          @touchend.prevent="controls.left = false"
        >
          A
        </button>
        <button
          class="dpad-btn right"
          aria-label="Move Right"
          @touchstart.prevent="controls.right = true"
          @touchend.prevent="controls.right = false"
        >
          D
        </button>
        <button
          class="dpad-btn down"
          aria-label="Move Backward"
          @touchstart.prevent="controls.backward = true"
          @touchend.prevent="controls.backward = false"
        >
          S
        </button>
      </div>
    </div>
    <div class="control-group right">
      <div class="dpad">
        <button
          class="dpad-btn up"
          aria-label="Look Up"
          @touchstart.prevent="lookControls.up = true"
          @touchend.prevent="lookControls.up = false"
        >
          ↑
        </button>
        <button
          class="dpad-btn left"
          aria-label="Look Left"
          @touchstart.prevent="lookControls.left = true"
          @touchend.prevent="lookControls.left = false"
        >
          ←
        </button>
        <button
          class="dpad-btn right"
          aria-label="Look Right"
          @touchstart.prevent="lookControls.right = true"
          @touchend.prevent="lookControls.right = false"
        >
          →
        </button>
        <button
          class="dpad-btn down"
          aria-label="Look Down"
          @touchstart.prevent="lookControls.down = true"
          @touchend.prevent="lookControls.down = false"
        >
          ↓
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Controls, LookControls } from '../../game/types';

defineProps<{ controls: Controls; lookControls: LookControls }>();
</script>

<style scoped>
#exploration-controls {
  position: fixed;
  bottom: 80px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  z-index: 20;
  pointer-events: none;
}

.control-group {
  display: flex;
  gap: 20px;
  pointer-events: auto;
}

.dpad {
  position: relative;
  width: 132px;
  height: 132px;
}

.dpad-btn {
  position: absolute;
  width: 44px;
  height: 44px;
  padding: 0;
  box-sizing: border-box;
  background: rgba(0, 255, 204, 0.2);
  border: 1px solid #00ffcc;
  color: #00ffcc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
}

.dpad-btn:active {
  background: rgba(0, 255, 204, 0.5);
  color: #fff;
}

.dpad-btn.up {
  top: 0;
  left: 44px;
}

.dpad-btn.down {
  bottom: 0;
  left: 44px;
}

.dpad-btn.left {
  top: 44px;
  left: 0;
}

.dpad-btn.right {
  top: 44px;
  right: 0;
}
</style>
