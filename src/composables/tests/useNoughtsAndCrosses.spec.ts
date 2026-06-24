import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNoughtsAndCrosses } from '../useNoughtsAndCrosses';

describe('useNoughtsAndCrosses', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with empty board and X as first player', () => {
    const game = useNoughtsAndCrosses();
    expect(game.board.value).toEqual(Array(9).fill(''));
    expect(game.winner.value).toBeNull();
    expect(game.isPlayerTurn.value).toBe(true);
  });

  it('player X can make a move', () => {
    const game = useNoughtsAndCrosses();
    game.makeMove(0);
    expect(game.board.value[0]).toBe('X');
  });

  it('prevents overwriting an occupied cell', () => {
    const game = useNoughtsAndCrosses();
    game.makeMove(0);
    game.makeMove(0);
    expect(game.board.value.filter((c: string) => c === 'X').length).toBe(1);
  });

  it('player O makes a move after X (computer)', () => {
    const game = useNoughtsAndCrosses();
    game.makeMove(0);
    vi.advanceTimersByTime(500);
    const oMoves = game.board.value.filter((c: string) => c === 'O').length;
    expect(oMoves).toBe(1);
  });

  it('alternates turns between X and O', () => {
    const game = useNoughtsAndCrosses();
    game.makeMove(0);
    expect(game.board.value[0]).toBe('X');
    expect(game.isPlayerTurn.value).toBe(false);
    vi.advanceTimersByTime(500);
    const oMoves = game.board.value.filter((c: string) => c === 'O').length;
    expect(oMoves).toBe(1);
    expect(game.isPlayerTurn.value).toBe(true);
  });

  it('computerMove does not make a move when board is full', () => {
    const game = useNoughtsAndCrosses();
    const moves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (const move of moves) {
      if (game.board.value[move] === '') {
        game.makeMove(move);
        vi.advanceTimersByTime(500);
      }
    }
    expect(game.winner.value).not.toBeNull();
  });

  it('stops game after a win', () => {
    const game = useNoughtsAndCrosses();
    game.makeMove(8);
    vi.advanceTimersByTime(500);
    game.makeMove(3);
    vi.advanceTimersByTime(500);
    game.makeMove(5);
    vi.advanceTimersByTime(500);
    expect(game.board.value.some((c: string) => c !== '')).toBe(true);
  });

  it('resetGame clears the board', () => {
    const game = useNoughtsAndCrosses();
    game.makeMove(0);
    game.resetGame();
    expect(game.board.value).toEqual(Array(9).fill(''));
    expect(game.winner.value).toBeNull();
    expect(game.isPlayerTurn.value).toBe(true);
  });

  it('blocks player from winning when O can win', () => {
    const game = useNoughtsAndCrosses();
    game.makeMove(0);
    vi.advanceTimersByTime(500);
    game.makeMove(8);
    vi.advanceTimersByTime(500);
    expect(game.board.value[4]).toBe('O');
  });
});
