<template>
  <div class="container" role="main" aria-label="Catch the Button Game">
    <h1>Catch the Button!</h1>
    <div class="instructions">
      <p>Click the button or press <kbd>Spacebar</kbd> as many times as you can. Reach <strong>{{ WIN_SCORE }}</strong> points to win!</p>
    </div>
    <div class="game-info">
      <p>Score: <strong>{{ score }}</strong></p>
      <p v-if="highScore > 0" class="high-score">High Score: <strong>{{ highScore }}</strong></p>
    </div>
    <div v-if="gameWon" class="winner-banner" role="alert">
      <h2>🎉 You won! You reached {{ WIN_SCORE }} points!</h2>
      <button @click="resetGame">Play Again</button>
    </div>
    <div class="game-area">
      <button
        @click="moveButton"
        :style="buttonStyle"
        aria-label="Catch me! Click to score a point"
        :disabled="gameWon"
      >
        Click Me!
      </button>
    </div>
    <div class="game-controls">
      <button @click="resetGame" class="outline">Reset Score</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useHead } from "@vueuse/head";

const WIN_SCORE = 10;
const MAX_POSITION = 90;
const STORAGE_KEY_HIGH_SCORE = "mini-game-high-score";

interface ButtonStyle {
  position: string;
  left: string;
  top: string;
  transform: string;
  transition: string;
}

const score = ref(0);
const highScore = ref(0);
const gameWon = ref(false);

const buttonStyle = reactive<ButtonStyle>({
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  transition: "all 0.3s ease",
});

useHead({
  title: "Elliot > Catch the Button!",
  meta: [
    {
      name: "description",
      content: "Play Catch the Button - a reflex game built with Vue.js",
    },
  ],
});

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY_HIGH_SCORE);
  if (saved) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed)) {
      highScore.value = parsed;
    }
  }
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});

const handleKeydown = (e: KeyboardEvent) => {
  if (e.code === "Space" && !gameWon.value) {
    e.preventDefault();
    moveButton();
  }
};

const moveButton = () => {
  if (gameWon.value) return;
  score.value++;

  if (score.value > highScore.value) {
    highScore.value = score.value;
    localStorage.setItem(STORAGE_KEY_HIGH_SCORE, highScore.value.toString());
  }

  if (score.value >= WIN_SCORE) {
    gameWon.value = true;
    return;
  }

  const newX = Math.random() * MAX_POSITION;
  const newY = Math.random() * MAX_POSITION;
  buttonStyle.left = `${newX}%`;
  buttonStyle.top = `${newY}%`;
};

const resetGame = () => {
  score.value = 0;
  gameWon.value = false;
  buttonStyle.left = "50%";
  buttonStyle.top = "50%";
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2rem;
}
.instructions {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  opacity: 0.9;
}
.instructions kbd {
  padding: 0.15rem 0.4rem;
  background: rgba(255,255,255,0.1);
  border: 1px solid var(--muted-border-color, #ccc);
  border-radius: 3px;
  font-size: 0.9em;
}
.game-info {
  display: flex;
  gap: 2rem;
  align-items: center;
}
.high-score {
  color: var(--primary, #1095c1);
}
.game-area {
  position: relative;
  width: 100%;
  height: 70vh;
  border: 1px solid var(--muted-border-color, #ccc);
  margin-top: 1rem;
  border-radius: 8px;
}
.winner-banner {
  text-align: center;
  padding: 1rem;
  background: var(--primary, #1095c1);
  color: white;
  border-radius: 8px;
  margin-top: 1rem;
}
.game-controls {
  margin-top: 1rem;
}
</style>
