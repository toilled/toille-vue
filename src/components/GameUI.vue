<template>
  <div v-if="drivingScore > 0" id="score-counter">SCORE: {{ drivingScore }}</div>
  <div v-if="isDrivingMode" id="timer-counter">TIME: {{ Math.ceil(timeLeft) }}</div>
  <div v-if="isDrivingMode" id="dist-counter">DIST: {{ Math.ceil(distToTarget) }}m</div>

  <GameOverModal
    v-if="isDrivingMode && isGameOver"
    :isGameOver="isGameOver"
    :drivingScore="drivingScore"
    :isDrivingMode="isDrivingMode"
    :leaderboard="leaderboard"
    @update-leaderboard="$emit('update-leaderboard', $event)"
  />

  <LeaderboardModal
    v-if="showLeaderboard"
    :showLeaderboard="showLeaderboard"
    :leaderboard="leaderboard"
    @close-leaderboard="$emit('close-leaderboard')"
  />

  <button
    v-if="isGameMode || isDrivingMode || isExplorationMode || isFlyingTour || isCinematicMode"
    id="return-button"
    @click="exitGameMode"
  >
    RETURN
  </button>

  <div v-if="isDrivingMode" id="driving-controls">
    <div class="control-group left">
      <button
        class="control-btn"
        @mousedown="controls.left = true"
        @mouseup="controls.left = false"
        @mouseleave="controls.left = false"
        @touchstart.prevent="controls.left = true"
        @touchend.prevent="controls.left = false"
      >
        ←
      </button>
      <button
        class="control-btn"
        @mousedown="controls.right = true"
        @mouseup="controls.right = false"
        @mouseleave="controls.right = false"
        @touchstart.prevent="controls.right = true"
        @touchend.prevent="controls.right = false"
      >
        →
      </button>
    </div>
    <div class="control-group right">
      <button
        class="control-btn"
        @mousedown="controls.backward = true"
        @mouseup="controls.backward = false"
        @mouseleave="controls.backward = false"
        @touchstart.prevent="controls.backward = true"
        @touchend.prevent="controls.backward = false"
      >
        BRK
      </button>
      <button
        class="control-btn"
        @mousedown="controls.forward = true"
        @mouseup="controls.forward = false"
        @mouseleave="controls.forward = false"
        @touchstart.prevent="controls.forward = true"
        @touchend.prevent="controls.forward = false"
      >
        GAS
      </button>
    </div>
  </div>

  <div v-if="isExplorationMode && isMobile" id="exploration-controls">
    <div class="control-group left">
      <div class="dpad">
        <button
          class="dpad-btn up"
          @touchstart.prevent="controls.forward = true"
          @touchend.prevent="controls.forward = false"
        >
          W
        </button>
        <button
          class="dpad-btn left"
          @touchstart.prevent="controls.left = true"
          @touchend.prevent="controls.left = false"
        >
          A
        </button>
        <button
          class="dpad-btn right"
          @touchstart.prevent="controls.right = true"
          @touchend.prevent="controls.right = false"
        >
          D
        </button>
        <button
          class="dpad-btn down"
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
          @touchstart.prevent="lookControls.up = true"
          @touchend.prevent="lookControls.up = false"
        >
          ↑
        </button>
        <button
          class="dpad-btn left"
          @touchstart.prevent="lookControls.left = true"
          @touchend.prevent="lookControls.left = false"
        >
          ←
        </button>
        <button
          class="dpad-btn right"
          @touchstart.prevent="lookControls.right = true"
          @touchend.prevent="lookControls.right = false"
        >
          →
        </button>
        <button
          class="dpad-btn down"
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
import { ref, watch, PropType } from 'vue';
import { Controls, LookControls } from '../game/types';
import { ScoreEntry } from '../utils/ScoreService';
import LeaderboardModal from './LeaderboardModal.vue';
import GameOverModal from './GameOverModal.vue';

const props = defineProps({
  isDrivingMode: Boolean,
  isGameMode: Boolean,
  isExplorationMode: Boolean,
  isFlyingTour: Boolean,
  isCinematicMode: Boolean,
  isGameOver: Boolean,
  isMobile: Boolean,
  drivingScore: Number,
  timeLeft: Number,
  distToTarget: Number,
  controls: {
    type: Object as PropType<Controls>,
    required: true,
  },
  lookControls: {
    type: Object as PropType<LookControls>,
    required: true,
  },
  leaderboard: {
    type: Array as PropType<ScoreEntry[]>,
    required: true,
  },
  showLeaderboard: Boolean,
});

const emit = defineEmits(['exit-game-mode', 'update-leaderboard', 'close-leaderboard']);

function exitGameMode() {
  emit('exit-game-mode');
}
</script>

<style scoped>
#score-counter {
  position: fixed;
  bottom: 20px;
  right: 20px;
  color: #00ffcc;
  font-family: 'Courier New', Courier, monospace;
  font-size: 24px;
  font-weight: bold;
  z-index: 10;
  text-shadow: 0 0 10px #00ffcc;
  pointer-events: none;
}

#timer-counter {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #ff00cc;
  font-family: 'Courier New', Courier, monospace;
  font-size: 32px;
  font-weight: bold;
  z-index: 10;
  text-shadow: 0 0 10px #ff00cc;
  pointer-events: none;
}

#dist-counter {
  position: fixed;
  top: 60px; /* Below timer */
  left: 50%;
  transform: translateX(-50%);
  color: #ffff00;
  font-family: 'Courier New', Courier, monospace;
  font-size: 24px;
  font-weight: bold;
  z-index: 10;
  text-shadow: 0 0 10px #ffff00;
  pointer-events: none;
}

#return-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: #ff00cc;
  border: 1px solid #ff00cc;
  padding: 10px 20px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  text-shadow: 0 0 5px #ff00cc;
  box-shadow: 0 0 10px #ff00cc;
}

#return-button:hover {
  background: rgba(255, 0, 204, 0.2);
  color: #ffffff;
  text-shadow: 0 0 10px #ffffff;
}

#driving-controls,
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
  pointer-events: none; /* Allow clicks to pass through empty space */
}

.control-group {
  display: flex;
  gap: 20px;
  pointer-events: auto;
}

.control-btn {
  width: 60px;
  height: 60px;
  background: rgba(0, 255, 204, 0.2);
  border: 2px solid #00ffcc;
  border-radius: 50%;
  color: #00ffcc;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
}

.control-btn:active {
  background: rgba(0, 255, 204, 0.5);
  color: #fff;
}

.dpad {
  position: relative;
  width: 100px;
  height: 100px;
}

.dpad-btn {
  position: absolute;
  width: 30px;
  height: 30px;
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
  left: 35px;
}
.dpad-btn.down {
  bottom: 0;
  left: 35px;
}
.dpad-btn.left {
  top: 35px;
  left: 0;
}
.dpad-btn.right {
  top: 35px;
  right: 0;
}
</style>
