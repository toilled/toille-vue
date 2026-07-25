import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NoughtsAndCrosses from '../NoughtsAndCrosses.vue';
import { useNoughtsAndCrosses } from '../../composables/useNoughtsAndCrosses';

vi.mock('../../composables/useNoughtsAndCrosses');

describe('NoughtsAndCrosses.vue', () => {
  const mockUseNoughtsAndCrosses = vi.mocked(useNoughtsAndCrosses);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the game board', () => {
    mockUseNoughtsAndCrosses.mockReturnValue({
      board: Array(9).fill(null),
      winner: null,
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.find('.board').exists()).toBe(true);
    expect(wrapper.findAll('.cell')).toHaveLength(9);
  });

  it('renders the title', () => {
    mockUseNoughtsAndCrosses.mockReturnValue({
      board: Array(9).fill(null),
      winner: null,
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain('Noughts and Crosses');
  });

  it('displays empty cells initially', () => {
    mockUseNoughtsAndCrosses.mockReturnValue({
      board: Array(9).fill(null),
      winner: null,
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    const cells = wrapper.findAll('.cell');
    cells.forEach((cell) => {
      expect(cell.text()).toBe('');
    });
  });

  it('displays X in cells when board has X', () => {
    const board = ['X', null, null, null, null, null, null, null, null];
    mockUseNoughtsAndCrosses.mockReturnValue({
      board,
      winner: null,
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.findAll('.cell')[0].text()).toBe('X');
  });

  it('displays O in cells when board has O', () => {
    const board = ['O', null, null, null, null, null, null, null, null];
    mockUseNoughtsAndCrosses.mockReturnValue({
      board,
      winner: null,
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: false,
    });

    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.findAll('.cell')[0].text()).toBe('O');
  });

  it('shows "Your turn (X)" when it is player turn', () => {
    mockUseNoughtsAndCrosses.mockReturnValue({
      board: Array(9).fill(null),
      winner: null,
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain('Your turn (X)');
  });

  it('shows "Bot is thinking..." when it is bot turn', () => {
    mockUseNoughtsAndCrosses.mockReturnValue({
      board: Array(9).fill(null),
      winner: null,
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: false,
    });

    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain('Bot is thinking...');
  });

  it('shows winner message when X wins', () => {
    mockUseNoughtsAndCrosses.mockReturnValue({
      board: ['X', 'X', 'X', null, null, null, null, null, null],
      winner: 'X',
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain('You win!');
    expect(wrapper.find('button').text()).toBe('Play Again');
  });

  it('shows winner message when O wins', () => {
    mockUseNoughtsAndCrosses.mockReturnValue({
      board: ['O', 'O', 'O', null, null, null, null, null, null],
      winner: 'O',
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain('You lose!');
  });

  it('shows draw message when draw', () => {
    mockUseNoughtsAndCrosses.mockReturnValue({
      board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],
      winner: 'draw',
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain("It's a draw!");
  });

  it('displays score board with correct values', () => {
    mockUseNoughtsAndCrosses.mockReturnValue({
      board: Array(9).fill(null),
      winner: null,
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain('You: 0');
    expect(wrapper.text()).toContain('Bot: 0');
    expect(wrapper.text()).toContain('Draws: 0');
  });

  it('calls makeMove when cell is clicked', async () => {
    const makeMove = vi.fn();
    mockUseNoughtsAndCrosses.mockReturnValue({
      board: Array(9).fill(null),
      winner: null,
      makeMove,
      resetGame: vi.fn(),
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    await wrapper.findAll('.cell')[0].trigger('click');
    expect(makeMove).toHaveBeenCalledWith(0);
  });

  it('calls resetGame when Play Again is clicked', async () => {
    const resetGame = vi.fn();
    mockUseNoughtsAndCrosses.mockReturnValue({
      board: ['X', 'X', 'X', null, null, null, null, null, null],
      winner: 'X',
      makeMove: vi.fn(),
      resetGame,
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    await wrapper.find('button').trigger('click');
    expect(resetGame).toHaveBeenCalled();
  });

  it('applies correct color style for X cells', () => {
    const board = ['X', null, null, null, null, null, null, null, null];
    mockUseNoughtsAndCrosses.mockReturnValue({
      board,
      winner: null,
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    const cell = wrapper.findAll('.cell')[0];
    expect(cell.attributes('style')).toContain('var(--primary');
  });

  it('applies correct color style for O cells', () => {
    const board = ['O', null, null, null, null, null, null, null, null];
    mockUseNoughtsAndCrosses.mockReturnValue({
      board,
      winner: null,
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: false,
    });

    const wrapper = mount(NoughtsAndCrosses);
    const cell = wrapper.findAll('.cell')[0];
    expect(cell.attributes('style')).toContain('var(--danger');
  });

  it('disables cells when game is over', () => {
    mockUseNoughtsAndCrosses.mockReturnValue({
      board: ['X', 'X', 'X', null, null, null, null, null, null],
      winner: 'X',
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    const cells = wrapper.findAll('.cell');
    cells.forEach((cell) => {
      expect(cell.attributes('aria-disabled')).toBe('true');
    });
  });

  it('disables cells when cell is filled', () => {
    const board = ['X', null, null, null, null, null, null, null, null];
    mockUseNoughtsAndCrosses.mockReturnValue({
      board,
      winner: null,
      makeMove: vi.fn(),
      resetGame: vi.fn(),
      isPlayerTurn: true,
    });

    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.findAll('.cell')[0].attributes('aria-disabled')).toBe('true');
    expect(wrapper.findAll('.cell')[1].attributes('aria-disabled')).toBe('false');
  });
});