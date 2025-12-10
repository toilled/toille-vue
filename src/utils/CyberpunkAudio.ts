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
  private seed: number;

  // Reusable buffers
  private snareBuffer: AudioBuffer | null = null;
  private hiHatBuffer: AudioBuffer | null = null;

  constructor() {
    this.seed = Date.now();
    this.generateBassPattern();
  }

  // Seeded random number generator (Mulberry32)
  private random() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  private generateBassPattern() {
    // Generate a 16-step bass pattern based on the seed
    // Root note E1 = 41.20 Hz
    const root = 41.20;
    const notes = [root, root * 2, root * 1.5]; // I, VIII, V
    this.bassPattern = [];

    for (let i = 0; i < 16; i++) {
        if (i % 2 === 0) { // On beats
             const r = this.random();
             if (r > 0.7) this.bassPattern.push(notes[2]); // V
             else if (r > 0.4) this.bassPattern.push(notes[1]); // VIII
             else this.bassPattern.push(notes[0]); // I
        } else {
            this.bassPattern.push(0); // Rest or sustain logic could go here, but simplistic for now
        }
    }
  }

  private initContext() {
     if (!this.ctx) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContext();
        this.createNoiseBuffers();
     }
  }

  private createNoiseBuffers() {
      if (!this.ctx) return;

      // Snare Buffer
      const snareSize = this.ctx.sampleRate * 0.1; // 100ms
      this.snareBuffer = this.ctx.createBuffer(1, snareSize, this.ctx.sampleRate);
      const snareData = this.snareBuffer.getChannelData(0);
      for (let i = 0; i < snareSize; i++) {
          snareData[i] = Math.random() * 2 - 1;
      }

      // HiHat Buffer
      const hatSize = this.ctx.sampleRate * 0.05; // 50ms
      this.hiHatBuffer = this.ctx.createBuffer(1, hatSize, this.ctx.sampleRate);
      const hatData = this.hiHatBuffer.getChannelData(0);
      for (let i = 0; i < hatSize; i++) {
          hatData[i] = Math.random() * 2 - 1;
      }
  }

  play() {
    this.initContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
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
    if (this.ctx && this.ctx.state === 'running') {
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
    this.nextNoteTime += 0.25 * secondsPerBeat; // 16th note
    this.current16thNote++;
    if (this.current16thNote === 16) {
      this.current16thNote = 0;
    }
  }

  private scheduleNote(beatNumber: number, time: number) {
      if (!this.ctx) return;

      // Synth Bass: generated pattern
      if (beatNumber % 2 === 0) {
         // Since we generated 16 steps, use beatNumber directly
         // Note: we only filled even indices in pattern generation, but let's just lookup
         const freq = this.bassPattern[beatNumber];
         if (freq > 0) this.playBass(time, freq);
      }

      // Kick: 4 on the floor
      if (beatNumber % 4 === 0) {
          this.playKick(time);
      }

      // Snare: 2 and 4
      if (beatNumber % 16 === 4 || beatNumber % 16 === 12) {
          this.playSnare(time);
      }

      // Hi-hats: 16th notes, alternating velocity
      this.playHiHat(time, beatNumber % 2 === 0);
  }

  private playBass(time: number, freq: number) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
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

  private playKick(time: number) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

      gain.gain.setValueAtTime(0.7, time); // Reduced from 0.8
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.1);
  }

  private playSnare(time: number) {
      if (!this.ctx || !this.snareBuffer) return;

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.snareBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 1000;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(time);

      // Body of snare (osc)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, time);
      oscGain.gain.setValueAtTime(0.2, time);
      oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.1);
  }

  private playHiHat(time: number, accent: boolean) {
      if (!this.ctx || !this.hiHatBuffer) return;

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.hiHatBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 8000;

      const gain = this.ctx.createGain();
      const vol = accent ? 0.15 : 0.05;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(time);
  }
}
