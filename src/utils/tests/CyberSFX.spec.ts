import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cyberSFX } from '../CyberSFX';
import { audioManager } from '../AudioManager';

describe('CyberSFX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not throw when sounds are triggered with audio disabled', () => {
    audioManager.isSoundEnabled.value = false;
    expect(() => cyberSFX.playHover()).not.toThrow();
    expect(() => cyberSFX.playClick()).not.toThrow();
    expect(() => cyberSFX.playWindowOpen()).not.toThrow();
    expect(() => cyberSFX.playWindowClose()).not.toThrow();
    expect(() => cyberSFX.playNitroBoost()).not.toThrow();
  });

  it('triggers sounds safely when audio is enabled', () => {
    audioManager.isSoundEnabled.value = true;
    expect(() => cyberSFX.playHover()).not.toThrow();
    expect(() => cyberSFX.playClick()).not.toThrow();
    expect(() => cyberSFX.playWindowOpen()).not.toThrow();
    expect(() => cyberSFX.playWindowClose()).not.toThrow();
    expect(() => cyberSFX.playNitroBoost()).not.toThrow();
  });
});
