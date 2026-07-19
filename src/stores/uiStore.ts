import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', () => {
  const terminal = ref(false);
  const desktopMode = ref(false);
  const checker = ref(false);
  const activity = ref(false);
  const joke = ref(false);
  const isContentVisible = ref(true);

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
  };
});
