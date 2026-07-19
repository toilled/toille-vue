import { useGameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { cityBackground } from '../utils/CityBackgroundManager';

export function useGameState() {
  const gameStore = useGameStore();
  const uiStore = useUIStore();

  const showCity = computed(
    () => gameStore.isClient && cityBackground.isEnabled.value && !uiStore.desktopMode
  );

  function startGame() {
    gameStore.enterGameMode();
  }

  function endGame() {
    gameStore.exitGameMode();
  }

  function handleCityFallback() {
    gameStore.setCityFallback(true);
  }

  function resetCityFallback() {
    gameStore.setCityFallback(false);
  }

  watch(showCity, (val) => {
    if (val) {
      resetCityFallback();
    }
  });

  return {
    gameMode: computed(() => gameStore.gameMode),
    cityFallback: computed(() => gameStore.cityFallback),
    showCity,
    isClient: computed(() => gameStore.isClient),
    setClient: gameStore.setClient,
    startGame,
    endGame,
    handleCityFallback,
    resetCityFallback,
  };
}
