export class CyberpunkAudio {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private tempo: number = 110;
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s
  private timerID: number | null = null;
  private current16thNote: number = 0;

  constructor() {
    // Defer context creation until user interaction (play) or explicitly called
  }

  private initContext() {
     if (!this.ctx) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContext();
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
    // Optionally suspend context to save CPU, but usually just stopping the scheduler is enough for a toggle
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

      // Synth Bass: Sawtooth, low pass filter envelope
      if (beatNumber % 2 === 0) {
         this.playBass(time, beatNumber);
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

  private playBass(time: number, beatNumber: number) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      // F#1 = ~46Hz, A1=55Hz, C2=65Hz
      // Let's go with a classic E or F key. E1=41.2Hz.
      // 16 step sequence
      const notes = [41.20, 41.20, 82.41, 41.20, 41.20, 41.20, 82.41, 41.20]; // E1, E1, E2, E1...
      const freq = notes[(beatNumber / 2) % 8];

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

      gain.gain.setValueAtTime(0.8, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.1);
  }

  private playSnare(time: number) {
      if (!this.ctx) return;
      // White noise buffer
      const bufferSize = this.ctx.sampleRate * 0.1; // 100ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

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
      if (!this.ctx) return;
       // White noise buffer
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

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
