import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioManager } from '../AudioManager';

describe('AudioManager', () => {
  beforeEach(() => {
    audioManager.isSoundEnabled.value = false;
    audioManager.ctx = null;
    audioManager.masterGain = null;
  });

  it('starts with sound disabled', () => {
    expect(audioManager.isSoundEnabled.value).toBe(false);
  });

  it('init creates AudioContext and master gain', () => {
    audioManager.init();
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
    const setValueSpy = vi.fn();
    if (audioManager.masterGain) {
      audioManager.masterGain.gain.setValueAtTime = setValueSpy;
    }
    audioManager.applyGain();
    expect(setValueSpy).toHaveBeenCalled();
  });
});
