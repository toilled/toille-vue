import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUIStore = defineStore('ui', () => {
  const terminal = ref(false);
  const desktopMode = ref(false);
  const checker = ref(false);
  const activity = ref(false);
  const joke = ref(false);
  const isContentVisible = ref(true);

  // CyberpunkCity UI state
  const showSplash = ref(true);
  const showLeaderboard = ref(false);
  const showStoryHint = ref(false);
  const showSignalFinder = ref(false);
  const showStoryTriggerPrompt = ref(false);
  const signalStrength = ref(0);
  const nearStoryTrigger = ref(false);
  const onlineCount = ref(0);
  const hdrSupported = ref(false);

  const leaderboard = ref<import('../utils/ScoreService').ScoreEntry[]>([]);
  const gameSessionId = ref<string | null>(null);

  const noFootersShowing = computed(() => {
    return !activity.value && !checker.value && !joke.value;
  });

  function toggleTerminal() {
    terminal.value = !terminal.value;
  }

  function toggleDesktop() {
    desktopMode.value = !desktopMode.value;
    if (desktopMode.value) {
      terminal.value = false;
    }
  }

  function toggleChecker() {
    checker.value = !checker.value;
  }

  function toggleActivity() {
    activity.value = !activity.value;
  }

  function toggleJoke() {
    joke.value = !joke.value;
  }

  function toggleContent() {
    isContentVisible.value = !isContentVisible.value;
  }

  // CyberpunkCity UI sync methods
  function syncShowSplash(val: boolean) {
    showSplash.value = val;
  }

  function syncShowLeaderboard(val: boolean) {
    showLeaderboard.value = val;
  }

  function syncShowStoryHint(val: boolean) {
    showStoryHint.value = val;
  }

  function syncShowSignalFinder(val: boolean) {
    showSignalFinder.value = val;
  }

  function syncShowStoryTriggerPrompt(val: boolean) {
    showStoryTriggerPrompt.value = val;
  }

  function syncSignalStrength(val: number) {
    signalStrength.value = val;
  }

  function syncNearStoryTrigger(val: boolean) {
    nearStoryTrigger.value = val;
  }

  function syncOnlineCount(val: number) {
    onlineCount.value = val;
  }

  function syncHdrSupported(val: boolean) {
    hdrSupported.value = val;
  }

  function syncLeaderboard(val: import('../utils/ScoreService').ScoreEntry[]) {
    leaderboard.value = val;
  }

  function syncGameSessionId(val: string | null) {
    gameSessionId.value = val;
  }

  return {
    terminal,
    desktopMode,
    checker,
    activity,
    joke,
    isContentVisible,
    noFootersShowing,
    toggleTerminal,
    toggleDesktop,
    toggleChecker,
    toggleActivity,
    toggleJoke,
    toggleContent,
    showSplash,
    showLeaderboard,
    showStoryHint,
    showSignalFinder,
    showStoryTriggerPrompt,
    signalStrength,
    nearStoryTrigger,
    onlineCount,
    hdrSupported,
    leaderboard,
    gameSessionId,
    syncShowSplash,
    syncShowLeaderboard,
    syncShowStoryHint,
    syncShowSignalFinder,
    syncShowStoryTriggerPrompt,
    syncSignalStrength,
    syncNearStoryTrigger,
    syncOnlineCount,
    syncHdrSupported,
    syncLeaderboard,
    syncGameSessionId,
  };
});