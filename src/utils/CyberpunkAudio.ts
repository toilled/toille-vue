import { audioManager } from "./AudioManager";

type NoteCallback = (type: string, data?: number) => void;

export class CyberpunkAudio {
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private tempo: number = 135;
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s
  private timerID: number | null = null;
  private current16thNote: number = 0;
  private bassPattern: number[] = [];
  private kickPattern: number[] = [];
  private snarePattern: number[] = [];
  private hiHatPattern: number[] = [];
  private seed: number;
  private listeners: NoteCallback[] = [];

  // Reusable buffers
  private snareBuffer: AudioBuffer | null = null;
  private hiHatBuffer: AudioBuffer | null = null;

  // Note scale
  private root = 41.2;
  private scale = [
    this.root, // I
    this.root * 1.059, // m2
    this.root * 1.189, // m3
    this.root * 1.498, // V
    this.root * 1.782, // b7
  ];

  constructor() {
    this.seed = Date.now();
    this.generateBassPattern();
    this.generateDrumPatterns();
  }

  public addListener(callback: NoteCallback) {
    this.listeners.push(callback);
  }

  public removeListener(callback: NoteCallback) {
    this.listeners = this.listeners.filter((l) => l !== callback);
  }

  // Seeded random number generator (Mulberry32)
  private random() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  private generateBassPattern() {
    this.bassPattern = new Array(128).fill(0);

    const motifLength = 32;
    for (let i = 0; i < 128; i++) {
      const motifPos = i % motifLength;

      let noteProbability = 0.85;

      if (i % 16 === 3 || i % 16 === 11) noteProbability = 0.1;

      if (this.random() < noteProbability) {
        let noteIndex = 0;

        const r = this.random();
        if (i >= 64 && motifPos % 16 === 14) {
          noteIndex = r > 0.5 ? 2 : 1;
        } else if (i >= 96 && motifPos % 8 === 6) {
          noteIndex = 3;
        }

        this.bassPattern[i] = noteIndex + 1; // 1-based index
      }
    }
  }

  private generateDrumPatterns() {
    this.kickPattern = new Array(128).fill(0);
    this.snarePattern = new Array(128).fill(0);
    this.hiHatPattern = new Array(128).fill(0);

    for (let bar = 0; bar < 8; bar++) {
      const offset = bar * 16;

      this.kickPattern[offset + 0] = 1.0;
      this.kickPattern[offset + 4] = 1.0;
      this.kickPattern[offset + 8] = 1.0;
      this.kickPattern[offset + 12] = 1.0;

      if (this.random() < 0.3) {
        this.kickPattern[offset + 14] = 0.7;
      }
      if (bar % 4 === 3 && this.random() < 0.8) {
        this.kickPattern[offset + 15] = 0.8;
      }

      this.snarePattern[offset + 4] = 1.0;
      this.snarePattern[offset + 12] = 1.0;

      if (this.random() < 0.2) this.snarePattern[offset + 7] = 0.3;
      if (this.random() < 0.2) this.snarePattern[offset + 15] = 0.4;

      for (let i = 0; i < 16; i++) {
        const globalIndex = offset + i;
        const isDownbeat = i % 4 === 0;
        const isUpbeat = i % 4 === 2;

        if (isUpbeat) {
          this.hiHatPattern[globalIndex] = 0.9;
        } else if (isDownbeat) {
          this.hiHatPattern[globalIndex] = 0.5;
        } else {
          this.hiHatPattern[globalIndex] = 0.3;
        }

        if (this.random() < 0.05) {
          this.hiHatPattern[globalIndex] = 0;
        }
      }
    }
  }

  private get ctx() {
    return audioManager.ctx;
  }

  private get dest() {
    return audioManager.masterGain || audioManager.ctx?.destination;
  }

  private initContext() {
    audioManager.init();
    if (this.ctx && !this.snareBuffer) {
      this.createNoiseBuffers();
    }
  }

  private createNoiseBuffers() {
    if (!this.ctx) return;

    const snareSize = this.ctx.sampleRate * 0.1;
    this.snareBuffer = this.ctx.createBuffer(1, snareSize, this.ctx.sampleRate);
    const snareData = this.snareBuffer.getChannelData(0);
    for (let i = 0; i < snareSize; i++) {
      snareData[i] = Math.random() * 2 - 1;
    }

    const hatSize = this.ctx.sampleRate * 0.05;
    this.hiHatBuffer = this.ctx.createBuffer(1, hatSize, this.ctx.sampleRate);
    const hatData = this.hiHatBuffer.getChannelData(0);
    for (let i = 0; i < hatSize; i++) {
      hatData[i] = Math.random() * 2 - 1;
    }
  }

  play() {
    this.initContext();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.current16thNote = 0;
      this.nextNoteTime = this.ctx.currentTime;
      this.scheduler();
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.timerID !== null) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
    if (this.ctx && this.ctx.state === "running") {
      this.ctx.suspend();
    }
  }

  private scheduler() {
    if (!this.ctx || !this.isPlaying) return;

    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.current16thNote, this.nextNoteTime);
      this.nextNote();
    }
    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += 0.25 * secondsPerBeat;
    this.current16thNote++;
    if (this.current16thNote === 128) {
      this.current16thNote = 0;
    }
  }

  private scheduleNote(beatNumber: number, time: number) {
    if (!this.ctx) return;

    let delay = (time - this.ctx.currentTime) * 1000;
    if (delay < 0) delay = 0;

    const triggerVisual = (type: string, data?: number) => {
      setTimeout(() => {
        this.listeners.forEach((l) => l(type, data));
      }, delay);
    };

    if (beatNumber % 2 === 0) {
      const noteVal = this.bassPattern[beatNumber];
      if (noteVal > 0) {
        const noteIndex = noteVal - 1;
        this.playBass(time, this.scale[noteIndex]);
        triggerVisual("bass", noteIndex);
      }
    }

    const kickVel = this.kickPattern[beatNumber];
    if (kickVel > 0) {
      this.playKick(time, kickVel);
      triggerVisual("kick", kickVel);
    }

    const snareVel = this.snarePattern[beatNumber];
    if (snareVel > 0) {
      this.playSnare(time, snareVel);
      triggerVisual("snare", snareVel);
    }

    const hatVel = this.hiHatPattern[beatNumber];
    if (hatVel > 0) {
      this.playHiHat(time, hatVel);
      triggerVisual("hihat", hatVel);
    }
  }

  private playBass(time: number, freq: number) {
    if (!this.ctx || !this.dest) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = "sawtooth";
    osc2.type = "square";
    // Detune osc2 slightly for a thicker sound
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.01, time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(100, time);
    filter.frequency.exponentialRampToValueAtTime(1200, time + 0.05);
    filter.frequency.exponentialRampToValueAtTime(100, time + 0.2);

    // Heavier bass
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.dest);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.25);
    osc2.stop(time + 0.25);
  }

  private playKick(time: number, velocity: number = 1.0) {
    if (!this.ctx || !this.dest) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);

    const peakGain = 1.0 * velocity;
    gain.gain.setValueAtTime(peakGain, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    osc.connect(gain);
    gain.connect(this.dest);

    osc.start(time);
    osc.stop(time + 0.15);
  }



  private playSnare(time: number, velocity: number = 1.0) {
    if (!this.ctx || !this.snareBuffer || !this.dest) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.snareBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    const peakNoiseGain = 0.5 * velocity;
    noiseGain.gain.setValueAtTime(peakNoiseGain, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.dest);

    noise.start(time);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(250, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.1);

    const peakOscGain = 0.3 * velocity;
    oscGain.gain.setValueAtTime(peakOscGain, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.dest);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playHiHat(time: number, velocity: number = 1.0) {
    if (!this.ctx || !this.hiHatBuffer || !this.dest) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.hiHatBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 8000;

    const gain = this.ctx.createGain();

    const isOpen = velocity > 1.0;
    const duration = isOpen ? 0.3 : 0.05;
    const actualVelocity = isOpen ? 1.0 : velocity;

    const peakGain = 0.15 * actualVelocity;

    gain.gain.setValueAtTime(peakGain, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.dest);

    noise.start(time);
  }
}

export const cyberpunkAudio = new CyberpunkAudio();
