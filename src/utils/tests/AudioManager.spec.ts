import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioManager } from '../AudioManager';

function triggerActivation() {
  document.dispatchEvent(new PointerEvent('pointerdown'));
}

describe('AudioManager', () => {
  beforeEach(() => {
    audioManager.isSoundEnabled.value = false;
    audioManager.ctx = null;
    audioManager.masterGain = null;
    (audioManager as unknown as { setupListeners: boolean }).setupListeners = false;
  });

  it('starts with sound disabled', () => {
    expect(audioManager.isSoundEnabled.value).toBe(false);
  });

  it('init defers context creation until user gesture', () => {
    audioManager.init();
    expect(audioManager.ctx).toBeNull();
    triggerActivation();
    expect(audioManager.ctx).not.toBeNull();
    expect(audioManager.masterGain).not.toBeNull();
  });

  it('toggleSound enables sound', () => {
    audioManager.toggleSound();
    expect(audioManager.isSoundEnabled.value).toBe(true);
  });

  it('toggleSound initializes context if null', () => {
    audioManager.toggleSound();
    expect(audioManager.ctx).not.toBeNull();
  });

  it('applyGain sets gain value based on isSoundEnabled', () => {
    audioManager.init();
    triggerActivation();
    const setValueSpy = vi.fn();
    if (audioManager.masterGain) {
      audioManager.masterGain.gain.setValueAtTime = setValueSpy;
    }
    audioManager.applyGain();
    expect(setValueSpy).toHaveBeenCalled();
  });
});
