interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

class AudioManager {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  isSoundEnabled = ref(false);
  photosensitivityConfirmed = false;
  private setupListeners = false;

  private ensureContext() {
    const AudioContext =
      window.AudioContext || (window as WindowWithAudioContext).webkitAudioContext;
    if (!AudioContext || this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.applyGain();
  }

  init() {
    if (this.setupListeners) return;
    this.setupListeners = true;

    const activate = () => {
      this.ensureContext();
      if (this.ctx?.state === 'suspended') {
        this.ctx.resume();
      }
    };

    document.addEventListener('pointerdown', activate, { once: true });
    document.addEventListener('keydown', activate, { once: true });
    document.addEventListener('touchstart', activate, { once: true });
  }

  applyGain() {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isSoundEnabled.value ? 1 : 0, this.ctx.currentTime);
    }
  }

  toggleSound() {
    this.isSoundEnabled.value = !this.isSoundEnabled.value;
    if (!this.ctx) {
      this.ensureContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.applyGain();
  }

  private get dest(): AudioNode {
    return this.masterGain || (this.ctx?.destination as AudioNode);
  }

  playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    volume = 0.5,
    type: OscillatorType = 'sawtooth'
  ) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, t);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
    osc.connect(gain);
    gain.connect(this.dest);
    osc.start(t);
    osc.stop(t + duration);
  }

  playToneAt(
    freqStart: number,
    freqEnd: number,
    duration: number,
    time: number,
    volume = 0.5,
    type: OscillatorType = 'sawtooth'
  ) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, time);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, time + duration);
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    osc.connect(gain);
    gain.connect(this.dest);
    osc.start(time);
    osc.stop(time + duration);
  }

  playNoise(duration: number, volume = 0.5, filterFreq?: number) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
    if (filterFreq) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = filterFreq;
      source.connect(filter);
      filter.connect(gain);
    } else {
      source.connect(gain);
    }
    gain.connect(this.masterGain);
    source.start(t);
  }
}

export const audioManager = new AudioManager();

watch(audioManager.isSoundEnabled, () => {
  audioManager.applyGain();
});
