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
}

export const audioManager = new AudioManager();

watch(audioManager.isSoundEnabled, () => {
  audioManager.applyGain();
});
