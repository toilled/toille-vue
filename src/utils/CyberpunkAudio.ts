interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

type NoteCallback = (type: string, data?: any) => void;

export class CyberpunkAudio {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private tempo: number = 110;
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
    this.root * 1.2, // m3
    this.root * 1.5, // V
    this.root * 1.78, // b7
    this.root * 2, // VIII
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
      if (i % 2 === 0) {
        const motifPos = i % motifLength;
        const isStrongBeat = motifPos % 16 === 0;
        const isOffBeat = motifPos % 4 === 2;

        let noteProbability = 0.5;
        if (isStrongBeat) noteProbability = 0.9;
        else if (isOffBeat) noteProbability = 0.7;

        const isVariationSection = i >= 64;
        if (isVariationSection && i % 4 === 0) {
          noteProbability += 0.2;
        }

        if (this.random() < noteProbability) {
          const r = this.random();
          let noteIndex;
          if (isStrongBeat) {
            noteIndex = r > 0.7 ? 4 : 0;
          } else {
            if (r > 0.8) noteIndex = 3;
            else if (r > 0.6) noteIndex = 2;
            else if (r > 0.4) noteIndex = 1;
            else noteIndex = 0;
          }
          this.bassPattern[i] = noteIndex + 1; // 1-based index
        }
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

      if (this.random() < 0.9) {
        this.kickPattern[offset + 8] = 1.0;
      }

      if (this.random() < 0.3) {
        this.kickPattern[offset + 10] = 0.8;
      }
      if (this.random() < 0.3) {
        this.kickPattern[offset + 14] = 0.7;
      }

      if ((bar + 1) % 4 === 0) {
        if (this.random() < 0.5) this.kickPattern[offset + 11] = 0.6;
        if (this.random() < 0.5) this.kickPattern[offset + 15] = 0.6;
      }

      this.snarePattern[offset + 4] = 1.0;
      this.snarePattern[offset + 12] = 1.0;

      if (this.random() < 0.4) this.snarePattern[offset + 7] = 0.3;
      if (this.random() < 0.3) this.snarePattern[offset + 9] = 0.3;
      if (this.random() < 0.3) this.snarePattern[offset + 15] = 0.2;

      for (let i = 0; i < 16; i++) {
        const globalIndex = offset + i;
        const isDownbeat = i % 4 === 0;
        const isUpbeat = i % 4 === 2;

        if (isUpbeat) {
          this.hiHatPattern[globalIndex] = 0.8;
        } else if (isDownbeat) {
          this.hiHatPattern[globalIndex] = 0.4;
        } else {
          this.hiHatPattern[globalIndex] = 0.2;
        }

        if (this.random() < 0.1) {
          this.hiHatPattern[globalIndex] = 0;
        }
      }

      if (this.random() < 0.2) {
        const upbeatIndex = offset + 2 + Math.floor(this.random() * 4) * 4;
        this.hiHatPattern[upbeatIndex] = 1.2;
      }
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContext =
        window.AudioContext ||
        (window as WindowWithAudioContext).webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.createNoiseBuffers();
      }
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

    const triggerVisual = (type: string, data?: any) => {
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
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, time);
    filter.frequency.exponentialRampToValueAtTime(800, time + 0.1);
    filter.frequency.exponentialRampToValueAtTime(200, time + 0.2);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private playKick(time: number, velocity: number = 1.0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

    const peakGain = 0.7 * velocity;
    gain.gain.setValueAtTime(peakGain, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playSnare(time: number, velocity: number = 1.0) {
    if (!this.ctx || !this.snareBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.snareBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    const peakNoiseGain = 0.4 * velocity;
    noiseGain.gain.setValueAtTime(peakNoiseGain, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(time);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(250, time);

    const peakOscGain = 0.2 * velocity;
    oscGain.gain.setValueAtTime(peakOscGain, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playHiHat(time: number, velocity: number = 1.0) {
    if (!this.ctx || !this.hiHatBuffer) return;

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
    gain.connect(this.ctx.destination);

    noise.start(time);
  }
}

export const cyberpunkAudio = new CyberpunkAudio();
