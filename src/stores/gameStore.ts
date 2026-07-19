import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', () => {
  const gameMode = ref(false);
  const cityFallback = ref(false);
  const isClient = ref(false);

  function enterGameMode() {
    gameMode.value = true;
  }

  function exitGameMode() {
    gameMode.value = false;
  }

  function setCityFallback(val: boolean) {
    cityFallback.value = val;
  }

  function setClient(val: boolean) {
    isClient.value = val;
  }

  return {
    gameMode,
    cityFallback,
    isClient,
    enterGameMode,
    exitGameMode,
    setCityFallback,
    setClient,
  };
});
