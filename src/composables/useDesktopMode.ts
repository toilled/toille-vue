import { useUIStore } from '../stores/uiStore';

export function useDesktopMode() {
  const uiStore = useUIStore();

  const desktopMode = computed(() => uiStore.desktopMode);
  const terminal = computed(() => uiStore.terminal);

  function toggleDesktop() {
    uiStore.toggleDesktop();
  }

  function toggleTerminal() {
    uiStore.toggleTerminal();
  }

  function openTerminal() {
    uiStore.terminal = true;
  }

  function closeTerminal() {
    uiStore.terminal = false;
  }

  function closeDesktop() {
    if (uiStore.desktopMode) {
      uiStore.toggleDesktop();
    }
  }

  return {
    desktopMode,
    terminal,
    toggleDesktop,
    toggleTerminal,
    openTerminal,
    closeTerminal,
    closeDesktop,
  };
}
