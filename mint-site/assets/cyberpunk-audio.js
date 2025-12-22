(function() {
interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

class CyberpunkAudio {
  private ctx | null = null;
  private isPlaying = false;
  private nextNoteTime = 0;
  private tempo = 110;
  private lookahead = 25.0; // ms
  private scheduleAheadTime = 0.1; // s
  private timerID | null = null;
  private current16thNote = 0;
  private bassPattern[] = [];
  private kickPattern[] = [];
  private snarePattern[] = [];
  private hiHatPattern[] = [];
  private seed;

  // Reusable buffers
  private snareBuffer | null = null;
  private hiHatBuffer | null = null;

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
    // Root note E1 = 41.20 Hz
    const root = 41.2;
    // Cyberpunk/Darkwave scale intervals relative to root (E1)
    // Minor pentatonic(1), m3(1.2), 4(1.33), 5(1.5), b7(1.78), Octave(2)
    const scale = [
      root, // I
      root * 1.2, // m3 (approx for E -> G)
      root * 1.5, // V
      root * 1.78, // b7 (approx for E -> D)
      root * 2, // VIII
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

        // Strong beat probability (beats 1 and 3)
        const isStrongBeat = motifPos % 16 === 0;
        // Off-beat syncopation probability
        const isOffBeat = motifPos % 4 === 2;

        let noteProbability = 0.5;
        if (isStrongBeat) noteProbability = 0.9;
        else if (isOffBeat) noteProbability = 0.7;

        // Variation every 4 bars (64 steps)
        const isVariationSection = i >= 64;
        if (isVariationSection && i % 4 === 0) {
          noteProbability += 0.2; // Busy it up in the second half
        }

        if (this.random() < noteProbability) {
          // Select pitch
          const r = this.random();
          let note;
          if (isStrongBeat) {
            // Anchor to root or octave on strong beats
            note = r > 0.7 ? scale[4] : scale[0];
          } else {
            // More freedom on other beats
            if (r > 0.8)
              note = scale[3]; // b7
            else if (r > 0.6)
              note = scale[2]; // V
            else if (r > 0.4)
              note = scale[1]; // m3
            else note = scale[0]; // I
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
      // Always on beat 1 (index 0 relative to bar)
      this.kickPattern[offset + 0] = 1.0;

      // High probability on beat 3 (index 8)
      if (this.random() < 0.9) {
        this.kickPattern[offset + 8] = 1.0;
      }

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

  private scheduleNote(beatNumber, time) {
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

  private playBass(time, freq) {
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

  private playKick(time, velocity = 1.0) {
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

  private playSnare(time, velocity = 1.0) {
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

  private playHiHat(time, velocity = 1.0) {
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

 window.CyberpunkAudio = CyberpunkAudio; })();