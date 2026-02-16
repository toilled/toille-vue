import { writable, get } from 'svelte/store';

export function useNoughtsAndCrosses() {
  const board = writable<string[]>(Array(9).fill(''));
  const currentPlayer = writable('X');
  const winner = writable<string | null>(null);

  const checkWinner = (board: string[], player: string) => {
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    return winConditions.some(combination =>
      combination.every(index => board[index] === player)
    );
  };

  const minimax = (board: string[], depth: number, isMaximizing: boolean): number => {
    if (checkWinner(board, 'O')) return 10 - depth;
    if (checkWinner(board, 'X')) return depth - 10;
    if (board.every(cell => cell)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          const newBoard = [...board];
          newBoard[i] = 'O';
          const score = minimax(newBoard, depth + 1, false);
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
          const score = minimax(newBoard, depth + 1, true);
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const computerMove = () => {
    let bestScore = -Infinity;
    let move = -1;
    const b = get(board);

    for (let i = 0; i < 9; i++) {
      if (b[i] === '') {
        const newBoard = [...b];
        newBoard[i] = 'O';
        const score = minimax(newBoard, 0, false);
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }

    if (move !== -1) {
        b[move] = 'O';
        board.set(b);

        if (checkWinner(b, 'O')) {
          winner.set('O');
        } else if (b.every(cell => cell)) {
          winner.set('draw');
        }

        currentPlayer.set('X');
    }
  };

  const makeMove = (index: number) => {
    const b = get(board);
    const w = get(winner);
    const cp = get(currentPlayer);

    if (b[index] || w) return;

    b[index] = cp;
    board.set(b);

    if (checkWinner(b, cp)) {
      winner.set(cp);
      return;
    }
    if (b.every(cell => cell)) {
      winner.set('draw');
      return;
    }

    currentPlayer.set('O');
    setTimeout(computerMove, 500); // Add small delay for realism/UI update
  };

  const resetGame = () => {
    board.set(Array(9).fill(''));
    currentPlayer.set('X');
    winner.set(null);
  };

  return {
    board,
    winner,
    makeMove,
    resetGame,
  };
}
