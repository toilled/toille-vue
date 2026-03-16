<template>
  <div v-if="showLeaderboard" id="leaderboard-modal">
    <div class="lb-header">LEADERBOARD</div>
    <div v-for="(entry, index) in leaderboard" :key="index" class="lb-row">
      <span class="lb-name">{{ index + 1 }}. {{ entry.name }}</span>
      <span class="lb-score">{{ entry.score }}</span>
    </div>
    <button class="close-btn" @click="$emit('close-leaderboard')">CLOSE</button>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { ScoreEntry } from "../utils/ScoreService";

defineProps({
    leaderboard: {
        type: Array as PropType<ScoreEntry[]>,
        required: true
    },
    showLeaderboard: Boolean
});

defineEmits(["close-leaderboard"]);
</script>

<style scoped>
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
