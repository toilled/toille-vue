import { Show, For } from "solid-js";
import { useNoughtsAndCrosses } from "../composables/useNoughtsAndCrosses";

export default function NoughtsAndCrosses() {
  const { board, winner, makeMove, resetGame } = useNoughtsAndCrosses();

  return (
    <div class="container">
      <h1>Noughts and Crosses</h1>
      <Show when={winner()}>
        <div class="winner">
          <h2>{winner() === "draw" ? "It's a draw!" : (winner() === "X" ? "You win!" : "You lose!")}</h2>
          <button onClick={resetGame}>Play Again</button>
        </div>
      </Show>
      <div class="board">
        <For each={board()}>
          {(cell, index) => (
            <div class="cell" onClick={() => makeMove(index())}>
              {cell}
            </div>
          )}
        </For>
      </div>
      <style>{`
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
      `}</style>
    </div>
  );
}
