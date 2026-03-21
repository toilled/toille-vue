import { ref, watch } from "vue";

interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

class AudioManager {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  isSoundEnabled = ref(false);

  init() {
    if (!this.ctx) {
      const AudioContext =
        window.AudioContext ||
        (window as WindowWithAudioContext).webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.applyGain();
      }
    }
  }

  applyGain() {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isSoundEnabled.value ? 1 : 0,
        this.ctx.currentTime,
      );
    }
  }

  toggleSound() {
    this.isSoundEnabled.value = !this.isSoundEnabled.value;
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    this.applyGain();
  }
}

export const audioManager = new AudioManager();

watch(audioManager.isSoundEnabled, () => {
  audioManager.applyGain();
});
