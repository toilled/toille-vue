interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

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

  // Reusable buffers
  private snareBuffer: AudioBuffer | null = null;
  private hiHatBuffer: AudioBuffer | null = null;

  constructor() {
    this.seed = Date.now();
    this.generateBassPattern();
    this.generateDrumPatterns();
  }

  // Seeded random number generator (Mulberry32)
  private random() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  private generateBassPattern() {
    // Generate a 128-step bass pattern based on the seed (8 bars)
    // Cyber Goth / EBM bass: often minimal, repetitive, rolling.
    // Lower root note C1 = 32.70 Hz or maybe D1 = 36.71 Hz
    const root = 36.71; // D1
    // Phrygian Dominant or similar "dark" intervals
    // Revised simple minor scale
    // I, m3, IV, V, b7
    const simpleMinor = [
      root,
      root * 1.189, // F
      root * 1.335, // G
      root * 1.5,   // A
      root * 1.782, // C
      root * 2
    ];

    this.bassPattern = new Array(128).fill(0);

    // Create a rhythmic motif (2 bars = 32 steps)
    // We will generate a motif and then repeat it with variations
    const motifLength = 32;
    for (let i = 0; i < 128; i++) {
      // Quantize to 8th notes (every 2 steps) for a driving feel
      if (i % 2 === 0) {
        // Determine position in the 2-bar motif
        const motifPos = i % motifLength;

        // EBM/Industrial typically has a rolling 16th note bassline or strict off-beat 8ths
        // Let's try a rolling 16th feel but we are quantizing to 8ths here (i%2==0).
        // Let's stick to 8th notes for simplicity but make it more relentless.

        const isStrongBeat = motifPos % 16 === 0;
        const isOffBeat = motifPos % 4 === 2; // The "and"

        // Cyber Goth / EBM: Relentless off-beat bass is common (The "k-dum k-dum" feel)
        // Or just straight 8ths.
        let noteProbability = 0.8; // High probability everywhere

        // Variation every 4 bars (64 steps)
        const isVariationSection = i >= 64;
        if (isVariationSection && i % 4 === 0) {
          noteProbability += 0.2; // Busy it up in the second half
        }

        if (this.random() < noteProbability) {
          // Select pitch
          const r = this.random();
          let note;
          // EBM bass often stays on root for long periods with octave jumps or m3/b7 accents
          if (isStrongBeat) {
             note = simpleMinor[0]; // Root
          } else {
            if (r > 0.8) note = simpleMinor[5]; // Octave
            else if (r > 0.6) note = simpleMinor[4]; // b7
            else if (r > 0.5) note = simpleMinor[1]; // m3
            else note = simpleMinor[0]; // Root
          }
          this.bassPattern[i] = note;
        }
      }
    }
  }

  private generateDrumPatterns() {
    this.kickPattern = new Array(128).fill(0);
    this.snarePattern = new Array(128).fill(0);
    this.hiHatPattern = new Array(128).fill(0);

    // Iterate by bars (16 steps)
    for (let bar = 0; bar < 8; bar++) {
      const offset = bar * 16;

      // -- Kick Drum --
      // Four-on-the-floor is essential for Cybergoth/Industrial Dance
      this.kickPattern[offset + 0] = 1.0;
      this.kickPattern[offset + 4] = 1.0;
      this.kickPattern[offset + 8] = 1.0;
      this.kickPattern[offset + 12] = 1.0;

      // Syncopation / Additional Kicks
      // e.g., on "and" of 3 (index 10) or "a" of 4 (index 15)
      // Varies per bar to avoid being too repetitive
      if (this.random() < 0.3) {
        this.kickPattern[offset + 10] = 0.8; // "and" of 3
      }
      if (this.random() < 0.3) {
        this.kickPattern[offset + 14] = 0.7; // "and" of 4
      }

      // Fill variation at end of 4th and 8th bar
      if ((bar + 1) % 4 === 0) {
        if (this.random() < 0.5) this.kickPattern[offset + 11] = 0.6; // "e" of 3
        if (this.random() < 0.5) this.kickPattern[offset + 15] = 0.6; // "a" of 4
      }

      // -- Snare Drum --
      // Backbeat on 2 and 4 (indices 4 and 12)
      this.snarePattern[offset + 4] = 1.0;
      this.snarePattern[offset + 12] = 1.0;

      // Ghost notes
      // e.g., on "a" of 2 (index 7) or "e" of 3 (index 9)
      if (this.random() < 0.4) this.snarePattern[offset + 7] = 0.3; // ghost "a" of 2
      if (this.random() < 0.3) this.snarePattern[offset + 9] = 0.3; // ghost "e" of 3
      if (this.random() < 0.3) this.snarePattern[offset + 15] = 0.2; // ghost "a" of 4

      // -- Hi-Hats --
      // 16th note stream
      for (let i = 0; i < 16; i++) {
        const globalIndex = offset + i;
        const isDownbeat = i % 4 === 0;
        const isUpbeat = i % 4 === 2; // "and"

        if (isUpbeat) {
          // Accented upbeats (techno feel)
          this.hiHatPattern[globalIndex] = 0.8;
        } else if (isDownbeat) {
          this.hiHatPattern[globalIndex] = 0.4;
        } else {
          // Weaker intermediate 16ths
          this.hiHatPattern[globalIndex] = 0.2;
        }

        // Randomly remove some hi-hats for breathing room
        if (this.random() < 0.1) {
          this.hiHatPattern[globalIndex] = 0;
        }
      }

      // Open Hi-Hat (simulated by longer decay or different gain in playHiHat logic if supported,
      // but here we just use high velocity for "open" feel or simple accent)
      // Let's say velocity 1.0 is "Open" or extra loud
      if (this.random() < 0.2) {
        // Open hat on an upbeat
        const upbeatIndex = offset + 2 + Math.floor(this.random() * 4) * 4;
        this.hiHatPattern[upbeatIndex] = 1.2; // > 1.0 indicates Open
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
    this.nextNoteTime += 0.25 * secondsPerBeat; // 16th note
    this.current16thNote++;
    if (this.current16thNote === 128) {
      this.current16thNote = 0;
    }
  }

  private scheduleNote(beatNumber: number, time: number) {
    if (!this.ctx) return;

    // Synth Bass: generated pattern
    if (beatNumber % 2 === 0) {
      const freq = this.bassPattern[beatNumber];
      if (freq > 0) this.playBass(time, freq);
    }

    // Kick
    const kickVel = this.kickPattern[beatNumber];
    if (kickVel > 0) {
      this.playKick(time, kickVel);
    }

    // Snare
    const snareVel = this.snarePattern[beatNumber];
    if (snareVel > 0) {
      this.playSnare(time, snareVel);
    }

    // Hi-hats
    const hatVel = this.hiHatPattern[beatNumber];
    if (hatVel > 0) {
      this.playHiHat(time, hatVel);
    }
  }

  private playBass(time: number, freq: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator(); // Add second osc for detune/fatness
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const distortion = this.ctx.createWaveShaper(); // Industrial distortion

    // Make a distortion curve
    function makeDistortionCurve(amount: number) {
      const k = typeof amount === 'number' ? amount : 50;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i ) {
        const x = i * 2 / n_samples - 1;
        curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
      }
      return curve;
    }

    distortion.curve = makeDistortionCurve(400);
    distortion.oversample = '4x';

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, time);

    osc2.type = "square";
    osc2.frequency.setValueAtTime(freq, time);
    osc2.detune.setValueAtTime(10, time); // Slight detune

    // Filter envelope (pluck)
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(100, time);
    filter.frequency.exponentialRampToValueAtTime(2000, time + 0.05); // Faster attack
    filter.frequency.exponentialRampToValueAtTime(100, time + 0.2);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    osc.connect(filter);
    osc2.connect(filter);

    // Connect filter to distortion then gain
    filter.connect(distortion);
    distortion.connect(gain);

    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.25);
    osc2.start(time);
    osc2.stop(time + 0.25);
  }

  private playKick(time: number, velocity: number = 1.0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

    // Scale gain by velocity
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
    // Scale noise gain
    const peakNoiseGain = 0.4 * velocity;
    noiseGain.gain.setValueAtTime(peakNoiseGain, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(time);

    // Body of snare (osc)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(250, time);

    // Scale osc gain
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

    // Handle Open Hat logic (velocity > 1.0)
    const isOpen = velocity > 1.0;
    const duration = isOpen ? 0.3 : 0.05;
    const actualVelocity = isOpen ? 1.0 : velocity;

    // Base volume scaling (previously accent was 0.15, weak 0.05)
    // Now we use velocity directly. Let's map 1.0 to ~0.15
    const peakGain = 0.15 * actualVelocity;

    gain.gain.setValueAtTime(peakGain, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
  }
}
