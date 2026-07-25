import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGameStore = defineStore('game', () => {
  // Game mode state
  const gameMode = ref(false);
  const cityFallback = ref(false);
  const isClient = ref(false);

  // Driving game state (pushed from GameState when UI needs updates)
  const score = ref(0);
  const drivingScore = ref(0);
  const timeLeft = ref(0);
  const isGameOver = ref(false);
  const distToTarget = ref(0);
  const isDrivingMode = ref(false);
  const isExplorationMode = ref(false);
  const isCinematicMode = ref(false);
  const isMobile = ref(false);

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

  // UI sync methods - called from CyberpunkCity.vue when game state changes
  function syncScore(val: number) {
    score.value = val;
  }

  function syncDrivingScore(val: number) {
    drivingScore.value = val;
  }

  function syncTimeLeft(val: number) {
    timeLeft.value = val;
  }

  function syncIsGameOver(val: boolean) {
    isGameOver.value = val;
  }

  function syncDistToTarget(val: number) {
    distToTarget.value = val;
  }

  function syncDrivingMode(val: boolean) {
    isDrivingMode.value = val;
  }

  function syncExplorationMode(val: boolean) {
    isExplorationMode.value = val;
  }

  function syncCinematicMode(val: boolean) {
    isCinematicMode.value = val;
  }

  function syncIsMobile(val: boolean) {
    isMobile.value = val;
  }

  return {
    // State
    gameMode,
    cityFallback,
    isClient,
    score,
    drivingScore,
    timeLeft,
    isGameOver,
    distToTarget,
    isDrivingMode,
    isExplorationMode,
    isCinematicMode,
    isMobile,

    // Actions
    enterGameMode,
    exitGameMode,
    setCityFallback,
    setClient,
    syncScore,
    syncDrivingScore,
    syncTimeLeft,
    syncIsGameOver,
    syncDistToTarget,
    syncDrivingMode,
    syncExplorationMode,
    syncCinematicMode,
    syncIsMobile,
  };
});