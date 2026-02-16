<script lang="ts">
  import { useNoughtsAndCrosses } from '../composables/useNoughtsAndCrosses';

  const { board, winner, makeMove, resetGame } = useNoughtsAndCrosses();
</script>

<div class="container">
  <h1>Noughts and Crosses</h1>
  {#if $winner}
    <div class="winner">
      <h2>{$winner === 'draw' ? "It's a draw!" : ($winner === 'X' ? 'You win!' : 'You lose!')}</h2>
      <button on:click={resetGame}>Play Again</button>
    </div>
  {/if}
  <div class="board">
    {#each $board as cell, index}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="cell" on:click={() => makeMove(index)}>
            {cell}
        </div>
    {/each}
  </div>
</div>

<style>
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
