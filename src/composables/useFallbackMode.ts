import { type Ref } from 'vue';
import { type WebGLRenderer, type Scene, type PerspectiveCamera } from 'three';
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
  FALLBACK_FPS_THRESHOLD,
  FALLBACK_FPS_CONSECUTIVE_CHECKS,
  FALLBACK_CHECK_INTERVAL_MS,
  FALLBACK_MONITOR_DELAY_MS,
} from '../game/constants/CyberpunkCity';

export interface UseFallbackModeOptions {
  renderer: () => WebGLRenderer;
  composer: () => EffectComposer | null;
  scene: () => Scene;
  camera: () => PerspectiveCamera;
  canvasContainer: Ref<HTMLDivElement | null>;
  isFallbackMode: Ref<boolean>;
  startTime: Ref<number>;
  emitFallback: () => void;
  cleanup: () => void;
}

export function useFallbackMode(options: UseFallbackModeOptions) {
  const {
    renderer: getRenderer,
    composer: getComposer,
    scene: getScene,
    camera: getCamera,
    canvasContainer,
    isFallbackMode,
    startTime,
    emitFallback,
    cleanup,
  } = options;

  const frameTimestamps: number[] = [];
  let lowFpsCount = 0;
  let lastFpsCheckTime = 0;

  function renderFallbackImage() {
    try {
      const dataUrl = getRenderer().domElement.toDataURL('image/png');
      if (!canvasContainer.value) return;
      while (canvasContainer.value.firstChild) {
        canvasContainer.value.removeChild(canvasContainer.value.firstChild);
      }
      const img = document.createElement('img');
      img.src = dataUrl;
      img.alt = '';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.display = 'block';
      canvasContainer.value.appendChild(img);
    } catch (_e) {
      if (!canvasContainer.value) return;
      while (canvasContainer.value.firstChild) {
        canvasContainer.value.removeChild(canvasContainer.value.firstChild);
      }
      canvasContainer.value.style.background = '#050510';
    }
  }

  function fallbackToStaticImage() {
    if (isFallbackMode.value) return;
    isFallbackMode.value = true;
    emitFallback();

    const _composer = getComposer();
    const _renderer = getRenderer();
    if (_composer) {
      _composer.render();
    } else {
      _renderer.render(getScene(), getCamera());
    }

    renderFallbackImage();
    cleanup();
  }

  function checkLowFps(now: number): boolean {
    if (lastFpsCheckTime === 0) {
      if (startTime.value > 0 && now - startTime.value > FALLBACK_MONITOR_DELAY_MS) {
        lastFpsCheckTime = now;
      }
      return false;
    }

    frameTimestamps.push(now);
    if (frameTimestamps.length > 60) frameTimestamps.shift();
    if (frameTimestamps.length < 30 || now - lastFpsCheckTime < FALLBACK_CHECK_INTERVAL_MS)
      return false;

    const elapsed = frameTimestamps[frameTimestamps.length - 1] - frameTimestamps[0];
    if (elapsed <= 0) return false;

    const fps = ((frameTimestamps.length - 1) / elapsed) * 1000;
    lastFpsCheckTime = now;

    if (fps < FALLBACK_FPS_THRESHOLD) {
      lowFpsCount++;
      if (lowFpsCount >= FALLBACK_FPS_CONSECUTIVE_CHECKS) {
        fallbackToStaticImage();
        return true;
      }
    } else {
      lowFpsCount = 0;
    }
    return false;
  }

  return { isFallbackMode, checkLowFps };
}
