<template>
  <div v-if="isGameOver" id="game-over">
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
</template>

<script setup lang="ts">
import { ref, PropType, watch } from "vue";
import { ScoreService, type ScoreEntry } from "../utils/ScoreService";

const props = defineProps({
  isGameOver: Boolean,
  drivingScore: Number,
  isDrivingMode: Boolean,
  leaderboard: {
    type: Array as PropType<ScoreEntry[]>,
    required: true,
  },
});

const emit = defineEmits(["update-leaderboard"]);

const playerName = ref("");
const isScoreSubmitted = ref(false);

watch(
  () => props.isGameOver,
  async (val) => {
    if (val && props.isDrivingMode) {
      isScoreSubmitted.value = false;
      const scores = await ScoreService.getTopScores();
      emit("update-leaderboard", scores);
    }
  },
  { immediate: true },
);

async function submitHighScore() {
  if (!playerName.value.trim()) return;
  const nameUpper = playerName.value.trim().toUpperCase();
  const finalScore = props.drivingScore;
  const newScores = await ScoreService.submitScore(nameUpper, finalScore || 0);
  isScoreSubmitted.value = true;
  emit("update-leaderboard", newScores);
}
</script>

<style scoped>
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
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.9);
  padding: 40px;
  border: 4px solid #ff0000;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 400px;
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
  gap: 20px;
  font-size: 20px;
  color: #fff;
  margin-bottom: 5px;
  text-transform: uppercase;
}
</style>
