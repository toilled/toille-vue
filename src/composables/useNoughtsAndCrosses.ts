import { createSignal } from "solid-js";

export function useNoughtsAndCrosses() {
  const [board, setBoard] = createSignal<string[]>(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = createSignal("X");
  const [winner, setWinner] = createSignal<string | null>(null);

  const makeMove = (index: number) => {
    if (board()[index] || winner()) return;

    setBoard((prev) => {
      const newBoard = [...prev];
      newBoard[index] = currentPlayer();
      return newBoard;
    });

    if (checkWinner(board(), currentPlayer())) {
      setWinner(currentPlayer());
      return;
    }
    if (board().every((cell) => cell)) {
      setWinner("draw");
      return;
    }

    setCurrentPlayer("O");
    computerMove();
  };

  const computerMove = () => {
    let bestScore = -Infinity;
    let move: number | undefined;
    const currentBoard = board();

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === "") {
        const newBoard = [...currentBoard];
        newBoard[i] = "O";
        const score = minimax(newBoard, 0, false);
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }

    if (move !== undefined) {
      setBoard((prev) => {
        const newBoard = [...prev];
        newBoard[move!] = "O";
        return newBoard;
      });

      if (checkWinner(board(), "O")) {
        setWinner("O");
      } else if (board().every((cell) => cell)) {
        setWinner("draw");
      }
    }

    setCurrentPlayer("X");
  };

  const minimax = (tempBoard: string[], depth: number, isMaximizing: boolean): number => {
    if (checkWinner(tempBoard, "O")) return 10 - depth;
    if (checkWinner(tempBoard, "X")) return depth - 10;
    if (tempBoard.every((cell) => cell)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === "") {
          const newBoard = [...tempBoard];
          newBoard[i] = "O";
          const score = minimax(newBoard, depth + 1, false);
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === "") {
          const newBoard = [...tempBoard];
          newBoard[i] = "X";
          const score = minimax(newBoard, depth + 1, true);
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const checkWinner = (tempBoard: string[], player: string) => {
    const winConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    return winConditions.some((combination) =>
      combination.every((index) => tempBoard[index] === player),
    );
  };

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setCurrentPlayer("X");
    setWinner(null);
  };

  return {
    board,
    winner,
    makeMove,
    resetGame,
  };
}
