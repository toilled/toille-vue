<template>
  <template v-if="isDrivingMode">
    <div v-if="drivingScore > 0" id="score-counter" role="status" aria-live="polite">
      SCORE: {{ drivingScore }}
    </div>
    <div id="timer-counter" role="timer" aria-live="polite" aria-atomic="true">
      TIME: {{ Math.ceil(timeLeft) }}
    </div>
    <div id="dist-counter" role="status" aria-live="polite">
      DIST: {{ Math.ceil(distToTarget) }}m
    </div>

    <GameOverModal
      v-if="showGameOver"
      :isGameOver="isGameOver"
      :drivingScore="drivingScore"
      :isDrivingMode="isDrivingMode"
      :leaderboard="leaderboard"
      :gameSessionId="gameSessionId"
      @update-leaderboard="$emit('update-leaderboard', $event)"
    />

    <DrivingControls :controls="controls" />
  </template>

  <LeaderboardModal
    v-if="showLeaderboard"
    :showLeaderboard="showLeaderboard"
    :leaderboard="leaderboard"
    @close-leaderboard="$emit('close-leaderboard')"
  />

  <button v-if="showReturn" id="return-button" @click="exitGameMode">RETURN</button>

  <ExplorationControls v-if="showExploration" :controls="controls" :look-controls="lookControls" />
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';
import { Controls, LookControls } from '../game/types';
import { ScoreEntry } from '../utils/ScoreService';
import DrivingControls from './game/DrivingControls.vue';
import ExplorationControls from './game/ExplorationControls.vue';

const props = defineProps({
  isDrivingMode: Boolean,
  isGameMode: Boolean,
  isExplorationMode: Boolean,
  isCinematicMode: Boolean,
  isGameOver: Boolean,
  isMobile: Boolean,
  drivingScore: { type: Number, default: 0 },
  timeLeft: { type: Number, default: 0 },
  distToTarget: { type: Number, default: 0 },
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
  gameSessionId: { type: String as PropType<string | null>, default: null },
});

const showGameOver = computed(() => props.isDrivingMode && props.isGameOver);
const showReturn = computed(
  () => props.isGameMode || props.isDrivingMode || props.isExplorationMode || props.isCinematicMode
);
const showExploration = computed(() => props.isExplorationMode && props.isMobile);

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
</style>
