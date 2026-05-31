import { describe, it, expect, vi, beforeEach } from "vitest";
import { CarAudio } from "../audio/CarAudio";

describe("CarAudio", () => {
  let carAudio: CarAudio;

  beforeEach(() => {
    carAudio = new CarAudio();
  });

  it("initializes with stopped state", () => {
    expect(carAudio.isPlaying).toBe(false);
    expect(carAudio.engineOsc).toBeNull();
    expect(carAudio.lfo).toBeNull();
  });

  it("start creates audio nodes", () => {
    carAudio.init();
    carAudio.start();
    expect(carAudio.isPlaying).toBe(true);
    expect(carAudio.engineOsc).not.toBeNull();
    expect(carAudio.engineGain).not.toBeNull();
    expect(carAudio.lfo).not.toBeNull();
    expect(carAudio.lfoGain).not.toBeNull();
  });

  it("stop cleans up audio nodes", () => {
    carAudio.init();
    carAudio.start();
    carAudio.stop();
    expect(carAudio.isPlaying).toBe(false);
    expect(carAudio.engineOsc).toBeNull();
    expect(carAudio.lfo).toBeNull();
  });

  it("update changes frequency based on speed", () => {
    carAudio.init();
    carAudio.start();
    const freqSetTargetSpy = vi.fn();
    const lfoFreqSetTargetSpy = vi.fn();
    if (carAudio.engineOsc) carAudio.engineOsc.frequency.setTargetAtTime = freqSetTargetSpy;
    if (carAudio.lfo) carAudio.lfo.frequency.setTargetAtTime = lfoFreqSetTargetSpy;
    carAudio.update(2);
    expect(freqSetTargetSpy).toHaveBeenCalled();
    expect(lfoFreqSetTargetSpy).toHaveBeenCalled();
  });

  it("playCrash creates crash sound", () => {
    carAudio.playCrash();
    expect(carAudio.ctx).not.toBeNull();
  });
});
