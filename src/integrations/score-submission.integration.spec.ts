import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import GameOverModal from '../components/GameOverModal.vue';
import { ScoreService } from '../utils/ScoreService';

describe('GameOverModal + ScoreService integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve([]),
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('loads leaderboard from real ScoreService on game over', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve([{ name: 'ACE', score: 1000 }]),
    } as never);

    const wrapper = mount(GameOverModal, {
      props: {
        isGameOver: true,
        drivingScore: 500,
        isDrivingMode: true,
        leaderboard: [],
      },
    });

    await flushPromises();

    expect(mockFetch).toHaveBeenCalledWith('/api/scores', expect.anything());
    expect(wrapper.emitted('update-leaderboard')).toBeTruthy();
    expect(wrapper.emitted('update-leaderboard')![0]).toEqual([[{ name: 'ACE', score: 1000 }]]);
  });

  it('submits score through real ScoreService and updates leaderboard', async () => {
    const mockFetch = vi.mocked(fetch);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve([]),
    } as never);

    const wrapper = mount(GameOverModal, {
      props: {
        isGameOver: true,
        drivingScore: 2000,
        isDrivingMode: true,
        leaderboard: [],
        gameSessionId: 'session-123',
      },
    });
    await flushPromises();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () =>
        Promise.resolve([
          { name: 'PLAYER', score: 2000 },
          { name: 'ACE', score: 1000 },
        ]),
    } as never);

    await wrapper.find('.name-input').setValue('PLAYER');
    await wrapper.find('.submit-btn').trigger('click');
    await flushPromises();

    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/scores',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          action: 'submit',
          game_id: 'session-123',
          name: 'PLAYER',
          score: 2000,
        }),
      })
    );

    const emitted = wrapper.emitted('update-leaderboard');
    expect(emitted).toBeTruthy();
    expect(emitted!.length).toBe(2);
    expect(emitted![1]).toEqual([
      [
        { name: 'PLAYER', score: 2000 },
        { name: 'ACE', score: 1000 },
      ],
    ]);
  });

  it('falls back to localStorage when API is unavailable', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error('Network error'));

    const scores = await ScoreService.submitScore('LOCAL', 300);
    expect(scores).toEqual([{ name: 'LOCAL', score: 300 }]);
    expect(localStorage.getItem('cyberpunk_city_scores')).toBeTruthy();
  });

  it('fetches from localStorage after API failure', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error('Network error'));

    await ScoreService.submitScore('LOCAL', 300);

    mockFetch.mockResolvedValueOnce(new Error('fail') as never);
    const localScores = await ScoreService.getTopScores();
    expect(localScores).toEqual([{ name: 'LOCAL', score: 300 }]);
  });

  it('validates name and score before submission', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error('Network error'));

    const emptyNameScores = await ScoreService.submitScore('', 500);
    expect(emptyNameScores).toEqual([]);

    const invalidScoreScores = await ScoreService.submitScore('TEST', NaN);
    expect(invalidScoreScores[0].score).toBe(0);
  });

  it('sanitizes long names', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error('Network error'));

    const scores = await ScoreService.submitScore('A'.repeat(30), 100);
    expect(scores[0].name.length).toBe(20);
  });
});
