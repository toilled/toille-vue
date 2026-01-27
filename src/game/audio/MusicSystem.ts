export class MusicSystem {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private analyser: AnalyserNode | null = null;
    private isPlaying = false;

    private nextNoteTime = 0;
    private current16thNote = 0;
    private tempo = 110;
    private scheduleAheadTime = 0.1; // seconds
    private lookahead = 25; // milliseconds
    private timerID: number | null = null;

    // C Minor Pentatonicish
    // C3, Eb3, F3, G3, Bb3, C4
    private scale = [130.81, 155.56, 174.61, 196.00, 233.08, 261.63];
    private bassFreqs = [65.41, 51.91, 43.65, 49.00]; // C2, Ab1, F1, G1

    private dataArray: Uint8Array | null = null;

    start() {
        if (this.isPlaying) return;

        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.15; // Moderate volume

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64; // We need 32 bars, so 64 fftSize gives 32 bins
        this.analyser.smoothingTimeConstant = 0.85;

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.isPlaying = true;
        this.current16thNote = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.1;

        this.timerID = window.setInterval(() => this.scheduler(), this.lookahead);
    }

    stop() {
        if (!this.isPlaying) return;

        if (this.timerID !== null) {
            window.clearInterval(this.timerID);
            this.timerID = null;
        }

        if (this.ctx) {
            this.ctx.close();
            this.ctx = null;
        }
        this.analyser = null;
        this.dataArray = null;
        this.masterGain = null;
        this.isPlaying = false;
    }

    private scheduler() {
        if (!this.ctx) return;
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.current16thNote, this.nextNoteTime);
            this.nextNote();
        }
    }

    private nextNote() {
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += 0.25 * secondsPerBeat; // Add quarter note duration (16th note subdivision?)
        // Actually 0.25 * beat is a 16th note if beat is quarter note.

        this.current16thNote++;
        if (this.current16thNote === 16) {
            this.current16thNote = 0;
        }
    }

    private scheduleNote(beatNumber: number, time: number) {
        if (!this.ctx || !this.masterGain) return;

        // Bass: every quarter note (0, 4, 8, 12)
        if (beatNumber % 4 === 0) {
            this.playBass(time, Math.floor(beatNumber / 4));
        }

        // Arpeggio: 16th notes
        // Simple pattern
        if (Math.random() > 0.3) {
             this.playArp(time);
        }

        // Snare/Hihat simple emulation
        if (beatNumber % 4 === 2) {
            this.playSnare(time);
        }
        if (beatNumber % 2 === 0) {
            this.playHiHat(time);
        }
    }

    private playBass(time: number, beatIndex: number) {
        if (!this.ctx || !this.masterGain) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        // Progression loop over 4 bars (16 beats), but here we just loop 4 bass notes per measure?
        // Let's change bass note every measure (16 ticks)
        // Actually passed beatIndex is 0..3 for the measure.

        // Let's do a global measure counter or just rely on randomness for now?
        // Better: use a simple progression index.
        const progressionIndex = Math.floor(Date.now() / 2000) % 4;
        const freq = this.bassFreqs[progressionIndex];

        osc.frequency.value = freq;

        // Lowpass filter for bass
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 400;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

        osc.start(time);
        osc.stop(time + 0.4);
    }

    private playArp(time: number) {
        if (!this.ctx || !this.masterGain) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "square";

        const noteIndex = Math.floor(Math.random() * this.scale.length);
        osc.frequency.value = this.scale[noteIndex];

        // Filter envelope
        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1000;
        filter.Q.value = 1;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        osc.start(time);
        osc.stop(time + 0.15);
    }

    private playSnare(time: number) {
        if (!this.ctx || !this.masterGain) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";

        // Noise buffer would be better but oscillator is cheaper to implement quickly
        // Let's just do a short burst

        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);

        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.1);
    }

    private playHiHat(time: number) {
        if (!this.ctx || !this.masterGain) return;
        // High frequency short blip
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.value = 8000;

        // Highpass
        const filter = this.ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 7000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.start(time);
        osc.stop(time + 0.05);
    }

    getFrequencyData(): Uint8Array {
        if (this.analyser && this.dataArray) {
            this.analyser.getByteFrequencyData(this.dataArray);
            return this.dataArray;
        }
        return new Uint8Array(0);
    }
}

export const musicSystem = new MusicSystem();
