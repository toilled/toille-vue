export class CarAudio {
    ctx: AudioContext | null = null;
    engineOsc: OscillatorNode | null = null;
    engineGain: GainNode | null = null;
    lfo: OscillatorNode | null = null;
    lfoGain: GainNode | null = null;
    isPlaying = false;

    init() {
        const AudioContext =
            window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        this.ctx = new AudioContext();
    }

    start() {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        if (this.ctx.state === "suspended") this.ctx.resume();
        if (this.isPlaying) return;

        // Engine rumble (Sawtooth with LFO for "purr")
        this.engineOsc = this.ctx.createOscillator();
        this.engineOsc.type = "sawtooth";
        this.engineOsc.frequency.value = 60; // Idle RPM

        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.value = 0.1;

        // LFO for modulation (the "chug-chug")
        this.lfo = this.ctx.createOscillator();
        this.lfo.type = "sine";
        this.lfo.frequency.value = 10;

        this.lfoGain = this.ctx.createGain();
        this.lfoGain.gain.value = 20; // Modulation depth

        this.lfo.connect(this.lfoGain);
        this.lfoGain.connect(this.engineOsc.frequency);

        // Filter to dampen the harsh sawtooth
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 400;

        this.engineOsc.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);

        this.engineOsc.start();
        this.lfo.start();
        this.isPlaying = true;
    }

    update(speed: number) {
        if (!this.ctx || !this.engineOsc || !this.lfo || !this.engineGain) return;

        // Pitch mapping
        // Speed 0 -> 60Hz
        // Speed 4 -> ~200Hz
        const absSpeed = Math.abs(speed);
        const targetFreq = 60 + absSpeed * 40;
        const targetLfoRate = 10 + absSpeed * 5;

        // Smooth transitions
        const time = this.ctx.currentTime;
        this.engineOsc.frequency.setTargetAtTime(targetFreq, time, 0.1);
        this.lfo.frequency.setTargetAtTime(targetLfoRate, time, 0.1);
    }

    stop() {
        if (!this.isPlaying) return;
        if (this.engineOsc) this.engineOsc.stop();
        if (this.lfo) this.lfo.stop();
        this.engineOsc = null;
        this.lfo = null;
        this.isPlaying = false;
    }

    playCrash() {
        if (!this.ctx) this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(10, t + 0.3);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.3);
    }
}

export const carAudio = new CarAudio();
