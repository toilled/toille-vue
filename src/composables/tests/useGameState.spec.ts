import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameState } from '../useGameState';
import { useGameStore } from '../../stores/gameStore';
import { useUIStore } from '../../stores/uiStore';

describe('useGameState', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with default state', () => {
    const state = useGameState();
    expect(state.gameMode.value).toBe(false);
    expect(state.cityFallback.value).toBe(false);
    expect(state.showCity.value).toBe(false);
  });

  it('enterGameMode sets gameMode to true', () => {
    const state = useGameState();
    state.startGame();
    expect(state.gameMode.value).toBe(true);
  });

  it('exitGameMode sets gameMode to false', () => {
    const state = useGameState();
    state.startGame();
    state.endGame();
    expect(state.gameMode.value).toBe(false);
  });

  it('handleCityFallback sets cityFallback to true', () => {
    const state = useGameState();
    state.handleCityFallback();
    expect(state.cityFallback.value).toBe(true);
  });

  it('setClient updates isClient', () => {
    const state = useGameState();
    state.setClient(true);
    expect(state.isClient.value).toBe(true);
  });

  it('showCity is false when desktopMode is active', () => {
    const uiStore = useUIStore();
    uiStore.toggleDesktop();
    const state = useGameState();
    state.setClient(true);
    expect(state.showCity.value).toBe(false);
  });

  it('shares state with gameStore', () => {
    const state = useGameState();
    const gameStore = useGameStore();
    state.startGame();
    expect(gameStore.gameMode).toBe(true);
  });
});
