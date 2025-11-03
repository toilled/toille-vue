document.addEventListener('DOMContentLoaded', () => {
  // Initialize event listeners for the main page
});

document.body.addEventListener('htmx:afterSwap', function(event) {
  // Initialize event listeners for the newly loaded content
  const target = event.detail.target;

  if (target.querySelector('#unit-count')) {
    initChecker();
  }
  if (target.querySelector('#game-button')) {
    initGame();
  }
  if (target.querySelector('#board')) {
    initNoughtsAndCrosses();
  }
});

function initChecker() {
  const countElement = document.getElementById('unit-count');
  const limitTimeElement = document.getElementById('limit-time');
  const soberTimeElement = document.getElementById('sober-time');
  const addButton = document.getElementById('add-unit');
  const subtractButton = document.getElementById('subtract-unit');

  let count = 0;

  function updateTimes() {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
    };
    const currentTime = new Date().getTime();
    if (count === 0) {
      limitTimeElement.textContent = new Date(currentTime).toLocaleTimeString([], options);
      soberTimeElement.textContent = new Date(currentTime).toLocaleTimeString([], options);
    } else {
      limitTimeElement.textContent = new Date(
        currentTime + count * 60 * 60 * 1000,
      ).toLocaleTimeString([], options);
      soberTimeElement.textContent = new Date(
        currentTime + (count + 1) * 60 * 60 * 1000,
      ).toLocaleTimeString([], options);
    }
  }

  addButton.addEventListener('click', () => {
    count++;
    countElement.textContent = count;
    updateTimes();
  });

  subtractButton.addEventListener('click', () => {
    if (count > 0) {
      count--;
      countElement.textContent = count;
      updateTimes();
    }
  });

  updateTimes();
}

function initGame() {
  const scoreElement = document.getElementById('score');
  const button = document.getElementById('game-button');
  let score = 0;

  button.addEventListener('click', () => {
    score++;
    scoreElement.textContent = score;
    const newX = Math.random() * 90;
    const newY = Math.random() * 90;
    button.style.left = `${newX}%`;
    button.style.top = `${newY}%`;
  });
}

function initNoughtsAndCrosses() {
  const boardElement = document.getElementById('board');
  const winnerMessageElement = document.getElementById('winner-message');
  const winnerTextElement = winnerMessageElement.querySelector('h2');
  const resetButton = document.getElementById('reset-game');
  const cells = boardElement.querySelectorAll('.cell');

  let board = ['', '', '', '', '', '', '', '', ''];
  let currentPlayer = 'X';
  let winner = null;

  function checkWinner() {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    if (board.every(cell => cell)) {
      return 'draw';
    }

    return null;
  }

  function makeMove(index) {
    if (board[index] || winner) {
      return;
    }

    board[index] = currentPlayer;
    cells[index].textContent = currentPlayer;
    winner = checkWinner();

    if (winner) {
      winnerTextElement.textContent = winner === 'draw' ? "It's a draw!" : (winner === 'X' ? 'You win!' : 'You lose!');
      winnerMessageElement.style.display = 'block';
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
  }

  function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    winner = null;
    cells.forEach(cell => (cell.textContent = ''));
    winnerMessageElement.style.display = 'none';
  }

  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      makeMove(cell.dataset.index);
    });
  });

  resetButton.addEventListener('click', resetGame);
}
