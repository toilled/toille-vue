<template>
  <div v-if="(isDrivingMode ? drivingScore : droneScore) > 0" id="score-counter">SCORE: {{ isDrivingMode ? drivingScore : droneScore }}</div>
  <div v-if="isDrivingMode" id="timer-counter">
    TIME: {{ Math.ceil(timeLeft) }}
  </div>
  <div v-if="isDrivingMode" id="dist-counter">
    DIST: {{ Math.ceil(distToTarget) }}m
  </div>
  <div v-if="isDrivingMode && isGameOver" id="game-over">
    <div class="game-over-title">GAME OVER</div>
    <div class="final-score">SCORE: {{ drivingScore }}</div>

    <div v-if="!isScoreSubmitted" class="score-form">
      <input
        v-model="playerName"
        placeholder="ENTER NAME"
        maxlength="8"
        @keyup.enter="submitHighScore"
        class="name-input"
        autofocus
      />
      <button @click="submitHighScore" class="submit-btn">SUBMIT</button>
    </div>

    <div class="leaderboard">
      <div class="lb-header">TOP DRIVERS</div>
      <div v-for="(entry, index) in leaderboard" :key="index" class="lb-row">
        <span class="lb-name">{{ index + 1 }}. {{ entry.name }}</span>
        <span class="lb-score">{{ entry.score }}</span>
      </div>
    </div>
  </div>

  <div v-if="showLeaderboard" id="leaderboard-modal">
    <div class="lb-header">LEADERBOARD</div>
    <div v-for="(entry, index) in leaderboard" :key="index" class="lb-row">
      <span class="lb-name">{{ index + 1 }}. {{ entry.name }}</span>
      <span class="lb-score">{{ entry.score }}</span>
    </div>
    <button class="close-btn" @click="$emit('close-leaderboard')">CLOSE</button>
  </div>

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
import { ref, watch, PropType } from "vue";
import { ScoreService, type ScoreEntry } from "../utils/ScoreService";
import { Controls, LookControls } from "../game/types";

const props = defineProps({
    isDrivingMode: Boolean,
    isGameMode: Boolean,
    isExplorationMode: Boolean,
    isFlyingTour: Boolean,
    isCinematicMode: Boolean,
    isGameOver: Boolean,
    isMobile: Boolean,
    drivingScore: Number,
    droneScore: Number,
    timeLeft: Number,
    distToTarget: Number,
    controls: {
        type: Object as PropType<Controls>,
        required: true
    },
    lookControls: {
        type: Object as PropType<LookControls>,
        required: true
    },
    leaderboard: {
        type: Array as PropType<ScoreEntry[]>,
        required: true
    },
    showLeaderboard: Boolean
});

const emit = defineEmits(["exit-game-mode", "update-leaderboard", "close-leaderboard"]);

const playerName = ref("");
const isScoreSubmitted = ref(false);

watch(() => props.isGameOver, async (val) => {
  if (val && props.isDrivingMode) {
    isScoreSubmitted.value = false;
    // We expect the parent to refresh leaderboard on game over if needed, or we just display what we have.
    // If we want fresh scores on game over, we should emit or fetch.
    // Let's assume parent passes fresh prop or we fetch here and emit up.
    // But better to let parent handle data.
    const scores = await ScoreService.getTopScores();
    emit("update-leaderboard", scores);
  }
});

async function submitHighScore() {
  if (!playerName.value.trim()) return;
  const nameUpper = playerName.value.trim().toUpperCase();
  const finalScore = props.isDrivingMode ? props.drivingScore : (props.droneScore || 0);
  const newScores = await ScoreService.submitScore(nameUpper, finalScore || 0);
  isScoreSubmitted.value = true;
  emit("update-leaderboard", newScores);
}

function exitGameMode() {
    emit("exit-game-mode");
}
</script>

<style scoped>
#score-counter {
  position: fixed;
  bottom: 20px;
  right: 20px;
  color: #00ffcc;
  font-family: "Courier New", Courier, monospace;
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
  font-family: "Courier New", Courier, monospace;
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
  font-family: "Courier New", Courier, monospace;
  font-size: 24px;
  font-weight: bold;
  z-index: 10;
  text-shadow: 0 0 10px #ffff00;
  pointer-events: none;
}

#game-over {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff0000;
  font-family: "Courier New", Courier, monospace;
  font-size: 64px;
  font-weight: bold;
  z-index: 30;
  text-shadow: 0 0 20px #ff0000;
  text-shadow: 0 0 20px #ff0000;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.9);
  padding: 40px;
  border: 4px solid #ff0000;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 400px;
}

#return-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: #ff00cc;
  border: 1px solid #ff00cc;
  padding: 10px 20px;
  font-family: "Courier New", Courier, monospace;
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
.game-over-title {
  font-size: 64px;
  color: #ff0000;
  margin-bottom: 20px;
}
.final-score {
  font-size: 32px;
  color: #ffff00;
  margin-bottom: 30px;
}
.score-form {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  z-index: 100;
}
.name-input {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #00ffcc;
  color: #00ffcc;
  padding: 10px;
  font-family: inherit;
  font-size: 24px;
  text-transform: uppercase;
  width: 200px;
  pointer-events: auto;
}
.submit-btn {
  background: #00ffcc;
  color: #000;
  border: none;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  pointer-events: auto;
}
.submit-btn:hover {
  background: #fff;
}
.leaderboard {
  width: 100%;
  max-width: 400px;
  text-align: left;
}
.lb-header {
  color: #ff00cc;
  font-size: 24px;
  border-bottom: 2px solid #ff00cc;
  margin-bottom: 10px;
  padding-bottom: 5px;
}
.lb-row {
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  color: #fff;
  margin-bottom: 5px;
  text-transform: uppercase;
}

#leaderboard-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #00ffcc;
  font-family: "Courier New", Courier, monospace;
  font-size: 24px;
  font-weight: bold;
  z-index: 100;
  text-shadow: 0 0 20px #00ffcc;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.9);
  padding: 40px;
  border: 4px solid #00ffcc;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 400px;
}
.close-btn {
  margin-top: 20px;
  background: #00ffcc;
  color: #000;
  border: none;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
}
.close-btn:hover {
  background: #fff;
}
</style>
