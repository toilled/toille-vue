import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, computed } from 'vue';
import NoughtsAndCrosses from '../NoughtsAndCrosses.vue';
import { useNoughtsAndCrosses } from '../../composables/useNoughtsAndCrosses';

vi.mock('../../composables/useNoughtsAndCrosses');

const createMock = (overrides: Record<string, unknown> = {}) => ({
  board: ref<string[]>(Array(9).fill('')),
  winner: ref<string | null>(null),
  makeMove: vi.fn(),
  resetGame: vi.fn(),
  isPlayerTurn: computed(() => true),
  ...overrides,
});

describe('NoughtsAndCrosses.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the game board', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(createMock({}));
    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.find('.board').exists()).toBe(true);
    expect(wrapper.findAll('.cell')).toHaveLength(9);
  });

  it('renders the title', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(createMock({}));
    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain('Noughts and Crosses');
  });

  it('displays empty cells initially', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(createMock({}));
    const wrapper = mount(NoughtsAndCrosses);
    const cells = wrapper.findAll('.cell');
    cells.forEach((cell) => {
      expect(cell.text()).toBe('');
    });
  });

  it('displays X in cells when board has X', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(
      createMock({ board: ref(['X', '', '', '', '', '', '', '', '']) })
    );
    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.findAll('.cell')[0].text()).toBe('X');
  });

  it('displays O in cells when board has O', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(
      createMock({ board: ref(['O', '', '', '', '', '', '', '', '']) })
    );
    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.findAll('.cell')[0].text()).toBe('O');
  });

  it('shows "Your turn (X)" when it is player turn', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(createMock({ isPlayerTurn: ref(true) }));
    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain('Your turn (X)');
  });

  it('shows "Bot is thinking..." when it is bot turn', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(createMock({ isPlayerTurn: ref(false) }));
    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain('Bot is thinking...');
  });

  it('shows winner message when X wins', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(
      createMock({
        board: ref(['X', 'X', 'X', '', '', '', '', '', '']),
        winner: ref('X'),
      })
    );
    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain('You win!');
    expect(wrapper.find('button').text()).toBe('Play Again');
  });

  it('shows winner message when O wins', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(
      createMock({
        board: ref(['O', 'O', 'O', '', '', '', '', '', '']),
        winner: ref('O'),
      })
    );
    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain('You lose!');
  });

  it('shows draw message when draw', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(
      createMock({
        board: ref(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']),
        winner: ref('draw'),
      })
    );
    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain("It's a draw!");
  });

  it('displays score board with correct values', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(createMock({}));
    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain('You: 0');
    expect(wrapper.text()).toContain('Bot: 0');
    expect(wrapper.text()).toContain('Draws: 0');
  });

  it('calls makeMove when cell is clicked', async () => {
    const makeMove = vi.fn();
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(createMock({ makeMove }));
    const wrapper = mount(NoughtsAndCrosses);
    await wrapper.findAll('.cell')[0].trigger('click');
    expect(makeMove).toHaveBeenCalledWith(0);
  });

  it('calls resetGame when Play Again is clicked', async () => {
    const resetGame = vi.fn();
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(
      createMock({
        board: ref(['X', 'X', 'X', '', '', '', '', '', '']),
        winner: ref('X'),
        resetGame,
      })
    );
    const wrapper = mount(NoughtsAndCrosses);
    await wrapper.find('button').trigger('click');
    expect(resetGame).toHaveBeenCalled();
  });

  it('applies correct color style for X cells', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(
      createMock({ board: ref(['X', '', '', '', '', '', '', '', '']) })
    );
    const wrapper = mount(NoughtsAndCrosses);
    const cell = wrapper.findAll('.cell')[0];
    expect(cell.attributes('style')).toContain('var(--primary');
  });

  it('applies correct color style for O cells', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(
      createMock({ board: ref(['O', '', '', '', '', '', '', '', '']) })
    );
    const wrapper = mount(NoughtsAndCrosses);
    const cell = wrapper.findAll('.cell')[0];
    expect(cell.attributes('style')).toContain('var(--danger');
  });

  it('disables cells when game is over', () => {
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(
      createMock({
        board: ref(['X', 'X', 'X', '', '', '', '', '', '']),
        winner: ref('X'),
      })
    );
    const wrapper = mount(NoughtsAndCrosses);
    const cells = wrapper.findAll('.cell');
    cells.forEach((cell) => {
      expect(cell.attributes('aria-disabled')).toBe('true');
    });
  });

  it('disables filled cells and empty cells when using empty string', () => {
    const boardRef = ref(['X', '', '', '', '', '', '', '', '']);
    vi.mocked(useNoughtsAndCrosses).mockReturnValue(createMock({ board: boardRef }));

    const wrapper = mount(NoughtsAndCrosses);
    // Component uses '' for empty cells, and aria-disabled checks !== null
    // So both filled ('X') and empty ('') cells have aria-disabled="true"
    expect(wrapper.findAll('.cell')[0].attributes('aria-disabled')).toBe('true');
    expect(wrapper.findAll('.cell')[1].attributes('aria-disabled')).toBe('true');
  });
});
