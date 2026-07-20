import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    WebGLRenderer: class {
      domElement = document.createElement('canvas');
      setSize = vi.fn();
      setPixelRatio = vi.fn();
      render = vi.fn();
      dispose = vi.fn();
      setAnimationLoop = vi.fn();
    },
  };
});

vi.mock('three/examples/jsm/postprocessing/EffectComposer', () => ({
  EffectComposer: class {
    addPass = vi.fn();
    render = vi.fn();
    setSize = vi.fn();
  },
}));

vi.mock('three/examples/jsm/postprocessing/RenderPass', () => ({
  RenderPass: class {},
}));

vi.mock('three/examples/jsm/postprocessing/UnrealBloomPass', () => ({
  UnrealBloomPass: class {},
}));

vi.mock('three/examples/jsm/postprocessing/AfterimagePass', () => ({
  AfterimagePass: class {
    enabled = false;
  },
}));

vi.mock('three/examples/jsm/postprocessing/GlitchPass', () => ({
  GlitchPass: class {
    enabled = false;
  },
}));

vi.mock('three/examples/jsm/postprocessing/OutputPass', () => ({
  OutputPass: class {},
}));

vi.stubGlobal(
  'requestAnimationFrame',
  vi.fn((cb: FrameRequestCallback) => setTimeout(cb, 16))
);
vi.stubGlobal(
  'cancelAnimationFrame',
  vi.fn((id: number) => clearTimeout(id))
);
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);
vi.stubGlobal(
  'AudioContext',
  class {
    state = 'running';
    resume() {
      return Promise.resolve();
    }
    close() {
      return Promise.resolve();
    }
    destination = {};
  }
);
vi.stubGlobal('webkitAudioContext', (globalThis as Record<string, unknown>).AudioContext);

import { renderToString } from '@vue/server-renderer';
import { createApp } from '../main';
import { createHead } from '@unhead/vue/server';

describe('SSR rendering integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage(url: string, locale?: string) {
    const head = createHead();
    const { app, router } = createApp(head, true);

    if (locale) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const appI18n = (app.config.globalProperties.$i18n as any)?.locale;
      if (appI18n && typeof appI18n === 'object' && 'value' in appI18n) {
        appI18n.value = locale;
      }
    }

    await router.push(url);
    await router.isReady();

    const html = await renderToString(app, {});
    const headPayload = head.render();
    const titleMatch = headPayload.headTags.match(/<title[^>]*>([^<]+)<\/title>/);
    const title = titleMatch?.[1] ?? '';

    return { html, title };
  }

  it('renders homepage with content', async () => {
    const { html } = await renderPage('/');
    expect(html).toBeDefined();
    expect(html).toContain('<div');
    expect(html.length).toBeGreaterThan(100);
  });

  it('renders with correct structure', async () => {
    const { html } = await renderPage('/');
    expect(html).toContain('id="content-wrapper"');
  });

  it('renders with English locale by default', async () => {
    const { html } = await renderPage('/');
    expect(html).toBeDefined();
  });

  it('renders with Spanish locale', async () => {
    const { html } = await renderPage('/', 'es');
    expect(html).toBeDefined();
  });

  it('renders quiz page', async () => {
    const { html } = await renderPage('/quiz');
    expect(html).toBeDefined();
    expect(html).toContain('<div');
  });

  it('renders noughts and crosses page', async () => {
    const { html } = await renderPage('/noughts-and-crosses');
    expect(html).toBeDefined();
    expect(html).toContain('<div');
  });

  it('renders checker page', async () => {
    const { html } = await renderPage('/checker');
    expect(html).toBeDefined();
    expect(html).toContain('<div');
  });

  it('handles unknown route gracefully', async () => {
    const { html } = await renderPage('/nonexistent-page');
    expect(html).toBeDefined();
    expect(html).toContain('<div');
  });
});
