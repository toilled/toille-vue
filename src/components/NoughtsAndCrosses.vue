<template>
  <v-container class="fill-height flex-column">
    <h1 class="text-h3 mb-4">Noughts and Crosses</h1>

    <div v-if="winner" class="text-center mb-4">
      <h2 class="text-h4 mb-2">
        {{ winner === 'draw' ? "It's a draw!" : (winner === 'X' ? 'You win!' : 'You lose!') }}
      </h2>
      <v-btn color="primary" @click="resetGame">Play Again</v-btn>
    </div>

    <v-card class="pa-2" elevation="4">
      <div class="board">
        <div
          v-for="(cell, index) in board"
          :key="index"
          class="cell d-flex justify-center align-center text-h3"
          @click="makeMove(index)"
        >
          {{ cell }}
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { useNoughtsAndCrosses } from '../composables/useNoughtsAndCrosses';

const { board, winner, makeMove, resetGame } = useNoughtsAndCrosses();
</script>

<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  grid-template-rows: repeat(3, 100px);
  gap: 5px;
  background-color: rgba(255, 255, 255, 0.1);
}
.cell {
  background-color: var(--v-theme-surface);
  cursor: pointer;
  transition: background-color 0.2s;
}
.cell:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
