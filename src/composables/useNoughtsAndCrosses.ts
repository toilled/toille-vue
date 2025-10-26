import { ref } from 'vue';

export function useNoughtsAndCrosses() {
  const board = ref(Array(9).fill(''));
  const currentPlayer = ref('X');
  const winner = ref(null);

  const makeMove = (index) => {
    if (board.value[index] || winner.value) return;

    board.value[index] = currentPlayer.value;
    if (checkWinner(board.value, currentPlayer.value)) {
      winner.value = currentPlayer.value;
      return;
    }
    if (board.value.every(cell => cell)) {
      winner.value = 'draw';
      return;
    }

    currentPlayer.value = 'O';
    computerMove();
  };

  const computerMove = () => {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
      if (board.value[i] === '') {
        const newBoard = [...board.value];
        newBoard[i] = 'O';
        let score = minimax(newBoard, 0, false);
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }

    board.value[move] = 'O';
    if (checkWinner(board.value, 'O')) {
      winner.value = 'O';
    } else if (board.value.every(cell => cell)) {
      winner.value = 'draw';
    }

    currentPlayer.value = 'X';
  };

  const minimax = (board, depth, isMaximizing) => {
    if (checkWinner(board, 'O')) return 10 - depth;
    if (checkWinner(board, 'X')) return depth - 10;
    if (board.every(cell => cell)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          const newBoard = [...board];
          newBoard[i] = 'O';
          let score = minimax(newBoard, depth + 1, false);
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          const newBoard = [...board];
          newBoard[i] = 'X';
          let score = minimax(newBoard, depth + 1, true);
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const checkWinner = (board, player) => {
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    return winConditions.some(combination =>
      combination.every(index => board[index] === player)
    );
  };

  const resetGame = () => {
    board.value = Array(9).fill('');
    currentPlayer.value = 'X';
    winner.value = null;
  };

  return {
    board,
    winner,
    makeMove,
    resetGame,
  };
}