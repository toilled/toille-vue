import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDesktopMode } from '../useDesktopMode';
import { useUIStore } from '../../stores/uiStore';

describe('useDesktopMode', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with desktop mode off', () => {
    const mode = useDesktopMode();
    expect(mode.desktopMode.value).toBe(false);
    expect(mode.terminal.value).toBe(false);
  });

  it('toggleDesktop enables desktop mode', () => {
    const mode = useDesktopMode();
    mode.toggleDesktop();
    expect(mode.desktopMode.value).toBe(true);
  });

  it('toggleDesktop disables terminal when entering desktop', () => {
    const uiStore = useUIStore();
    uiStore.terminal = true;
    const mode = useDesktopMode();
    mode.toggleDesktop();
    expect(mode.terminal.value).toBe(false);
  });

  it('toggleTerminal toggles terminal state', () => {
    const mode = useDesktopMode();
    mode.toggleTerminal();
    expect(mode.terminal.value).toBe(true);
    mode.toggleTerminal();
    expect(mode.terminal.value).toBe(false);
  });

  it('openTerminal sets terminal to true', () => {
    const mode = useDesktopMode();
    mode.openTerminal();
    expect(mode.terminal.value).toBe(true);
  });

  it('closeTerminal sets terminal to false', () => {
    const uiStore = useUIStore();
    uiStore.terminal = true;
    const mode = useDesktopMode();
    mode.closeTerminal();
    expect(mode.terminal.value).toBe(false);
  });

  it('closeDesktop exits desktop mode if active', () => {
    const mode = useDesktopMode();
    mode.toggleDesktop();
    expect(mode.desktopMode.value).toBe(true);
    mode.closeDesktop();
    expect(mode.desktopMode.value).toBe(false);
  });

  it('closeDesktop does nothing if desktop mode is off', () => {
    const mode = useDesktopMode();
    mode.closeDesktop();
    expect(mode.desktopMode.value).toBe(false);
  });

  it('shares state with uiStore', () => {
    const mode = useDesktopMode();
    const uiStore = useUIStore();
    mode.toggleDesktop();
    expect(uiStore.desktopMode).toBe(true);
  });
});
