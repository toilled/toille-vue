<template>
  <div class="container" role="main" aria-label="Noughts and Crosses Game">
    <h1>Noughts and Crosses</h1>
    <div class="instructions" v-if="!winner">
      <p>You are <strong>X</strong>. Click a cell to start playing!</p>
    </div>
    <div class="game-info" aria-live="polite">
      <p v-if="!winner" class="turn-indicator">
        {{ isPlayerTurn ? 'Your turn (X)' : 'Bot is thinking...' }}
      </p>
      <div class="score-board">
        <span class="score">You: {{ playerScore }}</span>
        <span class="score">Bot: {{ botScore }}</span>
        <span class="score">Draws: {{ draws }}</span>
      </div>
    </div>
    <div v-if="winner" class="winner" role="status" aria-live="assertive">
      <h2>{{ winner === 'draw' ? "It's a draw!" : winner === 'X' ? 'You win!' : 'You lose!' }}</h2>
      <button @click="resetGame">Play Again</button>
    </div>
    <div class="board" role="grid" aria-label="Game board">
      <button
        v-for="(cell, index) in board"
        :key="index"
        class="cell"
        role="gridcell"
        :aria-label="`Row ${Math.floor(index / 3) + 1}, Column ${(index % 3) + 1}, ${cell || 'empty'}`"
        :aria-disabled="cell !== null || !!winner"
        @click="makeMove(index)"
        :style="{
          color:
            cell === 'X'
              ? 'var(--primary, #1095c1)'
              : cell === 'O'
                ? 'var(--danger, #e74c3c)'
                : 'inherit',
        }"
      >
        {{ cell }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useNoughtsAndCrosses } from '../composables/useNoughtsAndCrosses';
import { ref, watch } from 'vue';
import { useHead } from '@vueuse/head';

const { board, winner, makeMove, resetGame, isPlayerTurn } = useNoughtsAndCrosses();

const playerScore = ref(0);
const botScore = ref(0);
const draws = ref(0);

useHead({
  title: 'Elliot > Noughts and Crosses',
  meta: [
    {
      name: 'description',
      content: 'Play Noughts and Crosses (Tic-Tac-Toe) against a bot',
    },
  ],
});

watch(winner, (newWinner) => {
  if (newWinner === 'X') playerScore.value++;
  else if (newWinner === 'O') botScore.value++;
  else if (newWinner === 'draw') draws.value++;
});
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
.game-info {
  text-align: center;
  margin-bottom: 1rem;
}
.turn-indicator {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.score-board {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
}
.score {
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.board {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  grid-template-rows: repeat(3, 100px);
  gap: 5px;
  margin-top: 1rem;
}
.cell {
  width: 100px;
  height: 100px;
  border: 1px solid var(--muted-border-color, #ccc);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  cursor: pointer;
  background: transparent;
  border-radius: 4px;
  transition: background 0.2s;
}
.cell:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}
.cell:disabled {
  cursor: default;
}
.winner {
  text-align: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--primary, #1095c1);
  color: white;
  border-radius: 8px;
}
</style>
