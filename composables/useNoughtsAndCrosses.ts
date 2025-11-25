import { ref, computed } from 'vue';

export function useNoughtsAndCrosses() {
  const board = ref(Array(9).fill(''));
  const player = ref('X');
  const winner = ref(null);

  const makeMove = (index) => {
    if (board.value[index] || winner.value) return;

    board.value[index] = player.value;
    player.value = player.value === 'X' ? 'O' : 'X';

    checkWinner();
  };

  const checkWinner = () => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (board.value[a] && board.value[a] === board.value[b] && board.value[a] === board.value[c]) {
        winner.value = board.value[a];
        return;
      }
    }

    if (board.value.every(cell => cell)) {
      winner.value = 'draw';
    }
  };

  const resetGame = () => {
    board.value = Array(9).fill('');
    player.value = 'X';
    winner.value = null;
  };

  return {
    board,
    winner,
    makeMove,
    resetGame,
  };
}
