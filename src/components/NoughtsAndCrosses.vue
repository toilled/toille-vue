<template>
  <div class="container">
    <h1>Noughts and Crosses</h1>
    <div v-if="winner" class="winner">
      <h2>{{ winner === 'draw' ? 'It\'s a draw!' : `Player ${winner} wins!` }}</h2>
      <button @click="resetGame">Play Again</button>
    </div>
    <div class="board">
      <div v-for="(cell, index) in board" :key="index" class="cell" @click="makeMove(index)">
        {{ cell }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNoughtsAndCrosses } from '../composables/useNoughtsAndCrosses';

const { board, winner, makeMove, resetGame } = useNoughtsAndCrosses();
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2rem;
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
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  cursor: pointer;
}
.winner {
  text-align: center;
  margin-bottom: 1rem;
}
</style>