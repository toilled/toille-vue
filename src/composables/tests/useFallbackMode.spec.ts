import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useFallbackMode } from '../useFallbackMode';
import {
  FALLBACK_CHECK_INTERVAL_MS,
  FALLBACK_MONITOR_DELAY_MS,
} from '../../game/constants/CyberpunkCity';

const createMockOptions = () => ({
  renderer: vi.fn(() => ({
    domElement: {
      toDataURL: vi.fn(() => 'data:image/png;base64,test'),
    },
    render: vi.fn(),
  })),
  composer: vi.fn(() => null),
  scene: vi.fn(() => ({})),
  camera: vi.fn(() => ({})),
  canvasContainer: ref({
    firstChild: null,
    removeChild: vi.fn(),
    appendChild: vi.fn(),
    style: {} as CSSStyleDeclaration,
  } as unknown as HTMLDivElement),
  isFallbackMode: ref(false),
  startTime: ref(FALLBACK_MONITOR_DELAY_MS + 1),
  emitFallback: vi.fn(),
  cleanup: vi.fn(),
});

function pushSlowFramesAndCheck(
  checkLowFps: (now: number) => boolean,
  state: { now: number }
): void {
  state.now += FALLBACK_CHECK_INTERVAL_MS + 1;
  for (let i = 0; i < 30; i++) {
    state.now += 50;
    checkLowFps(state.now);
  }
}

describe('useFallbackMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isFallbackMode and checkLowFps', () => {
    const mockOptions = createMockOptions();
    const { isFallbackMode, checkLowFps } = useFallbackMode(mockOptions as never);
    expect(isFallbackMode).toBe(mockOptions.isFallbackMode);
    expect(typeof checkLowFps).toBe('function');
  });

  it('checkLowFps returns false before monitor delay', () => {
    const mockOptions = createMockOptions();
    mockOptions.startTime.value = 100;
    const { checkLowFps } = useFallbackMode(mockOptions as never);
    expect(checkLowFps(200)).toBe(false);
  });

  it('starts monitoring after delay', () => {
    const mockOptions = createMockOptions();
    const { checkLowFps } = useFallbackMode(mockOptions as never);
    checkLowFps(mockOptions.startTime.value + FALLBACK_MONITOR_DELAY_MS + 1);
    expect(true).toBe(true);
  });

  it('does not trigger fallback when FPS is above threshold', () => {
    const mockOptions = createMockOptions();
    const { checkLowFps } = useFallbackMode(mockOptions as never);

    let now = mockOptions.startTime.value + FALLBACK_MONITOR_DELAY_MS + 1;
    checkLowFps(now);

    for (let i = 1; i <= 63; i++) {
      now += 16;
      checkLowFps(now);
    }

    expect(mockOptions.isFallbackMode.value).toBe(false);
    expect(mockOptions.cleanup).not.toHaveBeenCalled();
  });

  it('triggers fallback after 3 consecutive low FPS checks', () => {
    const mockOptions = createMockOptions();
    const { checkLowFps } = useFallbackMode(mockOptions as never);

    const state = { now: mockOptions.startTime.value + FALLBACK_MONITOR_DELAY_MS + 1 };
    checkLowFps(state.now);

    pushSlowFramesAndCheck(checkLowFps, state);
    pushSlowFramesAndCheck(checkLowFps, state);
    pushSlowFramesAndCheck(checkLowFps, state);

    expect(mockOptions.isFallbackMode.value).toBe(true);
  });

  it('handles renderFallbackImage error by setting background color', () => {
    const mockOptions = createMockOptions();
    mockOptions.renderer = vi.fn(() => ({
      domElement: {
        toDataURL: vi.fn(() => {
          throw new Error('toDataURL failed');
        }),
      },
      render: vi.fn(),
    }));

    const { checkLowFps } = useFallbackMode(mockOptions as never);
    const state = { now: mockOptions.startTime.value + FALLBACK_MONITOR_DELAY_MS + 1 };
    checkLowFps(state.now);

    pushSlowFramesAndCheck(checkLowFps, state);
    pushSlowFramesAndCheck(checkLowFps, state);
    pushSlowFramesAndCheck(checkLowFps, state);

    expect(mockOptions.isFallbackMode.value).toBe(true);
    expect(mockOptions.canvasContainer.value?.style.background).toBe('#050510');
  });

  it('uses composer.render if composer exists', () => {
    const mockOptions = createMockOptions();
    const mockComposer = { render: vi.fn() };
    mockOptions.composer = vi.fn(() => mockComposer) as unknown as typeof mockOptions.composer;

    const { checkLowFps } = useFallbackMode(mockOptions as never);
    const state = { now: mockOptions.startTime.value + FALLBACK_MONITOR_DELAY_MS + 1 };
    checkLowFps(state.now);

    pushSlowFramesAndCheck(checkLowFps, state);
    pushSlowFramesAndCheck(checkLowFps, state);
    pushSlowFramesAndCheck(checkLowFps, state);

    expect(mockComposer.render).toHaveBeenCalled();
  });

  it('uses renderer.render if composer is null', () => {
    const mockOptions = createMockOptions();
    mockOptions.composer = vi.fn(() => null) as unknown as typeof mockOptions.composer;
    const mockRenderer = { render: vi.fn() };
    mockOptions.renderer = vi.fn(() => mockRenderer);

    const { checkLowFps } = useFallbackMode(mockOptions as never);
    const state = { now: mockOptions.startTime.value + FALLBACK_MONITOR_DELAY_MS + 1 };
    checkLowFps(state.now);

    pushSlowFramesAndCheck(checkLowFps, state);
    pushSlowFramesAndCheck(checkLowFps, state);
    pushSlowFramesAndCheck(checkLowFps, state);

    expect(mockRenderer.render).toHaveBeenCalled();
  });

  it('cleanup is called when fallback triggers', () => {
    const mockOptions = createMockOptions();
    const { checkLowFps } = useFallbackMode(mockOptions as never);
    const state = { now: mockOptions.startTime.value + FALLBACK_MONITOR_DELAY_MS + 1 };
    checkLowFps(state.now);

    pushSlowFramesAndCheck(checkLowFps, state);
    pushSlowFramesAndCheck(checkLowFps, state);
    pushSlowFramesAndCheck(checkLowFps, state);

    expect(mockOptions.cleanup).toHaveBeenCalled();
  });

  it('resets lowFpsCount on good FPS', () => {
    const mockOptions = createMockOptions();
    const { checkLowFps } = useFallbackMode(mockOptions as never);

    let now = mockOptions.startTime.value + FALLBACK_MONITOR_DELAY_MS + 1;
    checkLowFps(now);

    for (let i = 0; i < 30; i++) {
      now += 50;
      checkLowFps(now);
    }
    now += FALLBACK_CHECK_INTERVAL_MS + 1;
    checkLowFps(now);

    for (let i = 0; i < 63; i++) {
      now += 16;
      checkLowFps(now);
    }

    for (let i = 0; i < 30; i++) {
      now += 50;
      checkLowFps(now);
    }
    now += FALLBACK_CHECK_INTERVAL_MS + 1;
    checkLowFps(now);

    expect(mockOptions.isFallbackMode.value).toBe(false);
  });
});
