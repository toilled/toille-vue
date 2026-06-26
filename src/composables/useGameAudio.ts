import { Vector3 } from 'three';
import { audioManager } from '../utils/AudioManager';
import {
  AUDIO_OSCILLATOR_FREQ_START,
  AUDIO_OSCILLATOR_FREQ_END,
  AUDIO_SWEEP_DURATION,
  AUDIO_VOLUME,
  AUDIO_DISTANCE_FACTOR,
  EMISSIVE_INTENSITY_BOOST_BASS,
  EMISSIVE_INTENSITY_BOOST_HIHAT,
} from '../game/constants/CyberpunkCity';

export function useGameAudio(
  camera: () => import('three').PerspectiveCamera,
  cityBuilder: () => import('../game/CityBuilder').CityBuilder,
  photosensitivityConfirmed: () => boolean
) {
  function playPewSound(pos?: Vector3) {
    audioManager.init();
    const audioCtx = audioManager.ctx;
    const dest = audioManager.masterGain || audioManager.ctx?.destination;

    if (!audioCtx || !dest) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(AUDIO_OSCILLATOR_FREQ_START, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      AUDIO_OSCILLATOR_FREQ_END,
      audioCtx.currentTime + AUDIO_SWEEP_DURATION
    );

    let volume = AUDIO_VOLUME;

    const cam = camera();
    if (pos && cam) {
      const dist = pos.distanceTo(cam.position);
      volume = AUDIO_VOLUME / (1 + dist / AUDIO_DISTANCE_FACTOR);

      if (volume < 0.001) volume = 0;
    }

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + AUDIO_SWEEP_DURATION);

    oscillator.connect(gainNode);
    gainNode.connect(dest);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + AUDIO_SWEEP_DURATION);
  }

  function onAudioNote(type: string, data?: string | number) {
    const builder = cityBuilder();
    if (!builder) return;
    const materials = builder.getAudioMaterials();
    let key = '';
    if (type === 'bass') {
      key = `bass${data}`;
    } else {
      key = type;
    }
    if (materials[key] && photosensitivityConfirmed()) {
      let boost = EMISSIVE_INTENSITY_BOOST_BASS;
      if (type === 'hihat') boost = EMISSIVE_INTENSITY_BOOST_HIHAT;
      materials[key].emissiveIntensity = boost;
    }
  }

  return { playPewSound, onAudioNote };
}
