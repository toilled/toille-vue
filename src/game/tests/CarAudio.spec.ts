import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audioManager } from '../../utils/AudioManager';
import { CarAudio } from '../audio/CarAudio';

function activateAudio() {
  audioManager.init();
  document.dispatchEvent(new PointerEvent('pointerdown'));
}

describe('CarAudio', () => {
  let carAudio: CarAudio;

  beforeEach(() => {
    (audioManager as unknown as { setupListeners: boolean }).setupListeners = false;
    audioManager.ctx = null;
    audioManager.masterGain = null;
    carAudio = new CarAudio();
  });

  it('initializes with stopped state', () => {
    expect(carAudio.isPlaying).toBe(false);
    expect(carAudio.engineOsc).toBeNull();
    expect(carAudio.lfo).toBeNull();
  });

  it('start creates audio nodes', () => {
    activateAudio();
    carAudio.start();
    expect(carAudio.isPlaying).toBe(true);
    expect(carAudio.engineOsc).not.toBeNull();
    expect(carAudio.engineGain).not.toBeNull();
    expect(carAudio.lfo).not.toBeNull();
    expect(carAudio.lfoGain).not.toBeNull();
  });

  it('stop cleans up audio nodes', () => {
    activateAudio();
    carAudio.start();
    carAudio.stop();
    expect(carAudio.isPlaying).toBe(false);
    expect(carAudio.engineOsc).toBeNull();
    expect(carAudio.lfo).toBeNull();
  });

  it('update changes frequency based on speed', () => {
    activateAudio();
    carAudio.start();
    const freqSetTargetSpy = vi.fn();
    const lfoFreqSetTargetSpy = vi.fn();
    if (carAudio.engineOsc) carAudio.engineOsc.frequency.setTargetAtTime = freqSetTargetSpy;
    if (carAudio.lfo) carAudio.lfo.frequency.setTargetAtTime = lfoFreqSetTargetSpy;
    carAudio.update(2);
    expect(freqSetTargetSpy).toHaveBeenCalled();
    expect(lfoFreqSetTargetSpy).toHaveBeenCalled();
  });

  it('playCrash creates crash sound', () => {
    activateAudio();
    carAudio.playCrash();
    expect(carAudio.ctx).not.toBeNull();
  });
});
