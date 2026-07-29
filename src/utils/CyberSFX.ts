import { audioManager } from './AudioManager';

class CyberSFXEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (import.meta.env.SSR) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private isEnabled(): boolean {
    return audioManager.isSoundEnabled.value;
  }

  private playTone(
    type: OscillatorType,
    startFreq: number,
    endFreq: number,
    duration: number,
    startGain: number
  ): void {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);

      gain.gain.setValueAtTime(startGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio context autoplay limitations
    }
  }

  playHover(): void {
    this.playTone('sine', 800, 1200, 0.05, 0.04);
  }

  playClick(): void {
    this.playTone('triangle', 1500, 400, 0.08, 0.08);
  }

  playWindowOpen(): void {
    this.playTone('sine', 300, 900, 0.15, 0.06);
  }

  playWindowClose(): void {
    this.playTone('sine', 800, 250, 0.12, 0.05);
  }

  playNitroBoost(): void {
    this.playTone('sawtooth', 120, 360, 0.35, 0.12);
  }
}

export const cyberSFX = new CyberSFXEngine();
