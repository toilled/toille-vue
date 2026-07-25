import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemoMode } from '../../modes/DemoMode';
import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import type { GameContext } from '../../types';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GameState } from '../../GameState';

vi.mock('../../../utils/CyberpunkAudio', () => ({
  cyberpunkAudio: {
    play: vi.fn(),
    pause: vi.fn(),
    dispose: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
}));

vi.mock('../../../utils/AudioManager', () => ({
  audioManager: {
    isSoundEnabled: { value: false },
  },
}));

vi.mock('three/examples/jsm/postprocessing/AfterimagePass', () => ({
  AfterimagePass: class {
    enabled = false;
    uniforms = { damp: { value: 0.96 } };
    constructor() {}
  },
}));

vi.mock('three/examples/jsm/postprocessing/GlitchPass', () => ({
  GlitchPass: class {
    enabled = false;
    goWild = false;
    constructor() {}
  },
}));

describe('DemoMode', () => {
  let mode: DemoMode;
  let context: GameContext;
  let composer: EffectComposer;

  beforeEach(() => {
    mode = new DemoMode();
    composer = new EffectComposer(new WebGLRenderer());
    composer.passes = [
      { strength: 1.5, radius: 0.4, threshold: 0.85, render: vi.fn() },
    ] as any;
    const gameState = new GameState(
      new Scene(),
      new PerspectiveCamera(),
      new WebGLRenderer(),
      composer,
      [],
      [],
      new Map(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      undefined,
      {} as any,
      {} as any,
    );
    context = {
      gameState,
      scene: new Scene(),
      camera: new PerspectiveCamera(),
      renderer: new WebGLRenderer(),
      composer,
      cars: [],
      buildings: [],
      occupiedGrids: new Map(),
      spawnSparks: vi.fn(),
      playPewSound: vi.fn(),
      spawnCheckpoint: vi.fn(),
      reportCheckpoint: vi.fn(),
      checkpointMesh: undefined,
      navArrow: {} as any,
      chaseArrow: {} as any,
    };
  });

  it('init sets context and adds audio listener', () => {
    mode.init(context);
    expect(context.composer?.addPass).toHaveBeenCalled();
  });

  it('update cycles through 4 scenes', () => {
    mode.init(context);
    mode.update(0.1, 0);
    expect(mode['sceneIndex']).toBe(0);
  });

  it('transitions to next scene after duration', () => {
    mode.init(context);
    mode.update(8.1, 0);
    expect(mode['sceneIndex']).toBe(1);
  });

  it('wraps back to scene 0 after scene 3', () => {
    mode.init(context);
    mode['sceneIndex'] = 3;
    mode.update(8.1, 0);
    expect(mode['sceneIndex']).toBe(0);
  });

  it('cleanup removes audio listener and restores bloom', () => {
    mode.init(context);
    mode.cleanup();
    expect(() => mode.cleanup()).not.toThrow();
  });

  it('event handlers do not throw', () => {
    mode.init(context);
    expect(() => mode.onKeyDown(new KeyboardEvent('keydown'))).not.toThrow();
    expect(() => mode.onKeyUp(new KeyboardEvent('keyup'))).not.toThrow();
    expect(() => mode.onClick(new MouseEvent('click'))).not.toThrow();
    expect(() => mode.onMouseMove(new MouseEvent('mousemove'))).not.toThrow();
  });
});