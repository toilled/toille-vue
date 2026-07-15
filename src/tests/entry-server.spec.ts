import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPush = vi.fn().mockResolvedValue(undefined);
const mockIsReady = vi.fn().mockResolvedValue(undefined);
const mockSetLocaleMessage = vi.fn();
const mockRenderToString = vi.fn().mockResolvedValue('<div id="app"></div>');
const mockHeadRender = vi.fn().mockReturnValue({
  headTags: '<title>Home</title>',
  bodyTags: '',
  bodyTagsOpen: '',
  htmlAttrs: '',
  bodyAttrs: '',
});

vi.doMock('@vue/server-renderer', () => ({
  renderToString: (...args: unknown[]) => mockRenderToString(...args),
}));

vi.doMock('@unhead/vue/server', () => ({
  createHead: vi.fn(() => ({
    render: mockHeadRender,
  })),
}));

vi.doMock('../main', () => ({
  createApp: vi.fn(() => ({
    app: {
      config: {
        globalProperties: {
          $i18n: {
            locale: { value: 'en' },
          },
        },
      },
    },
    router: {
      push: mockPush,
      isReady: mockIsReady,
    },
  })),
}));

vi.doMock('../i18n', () => ({
  default: {
    global: {
      setLocaleMessage: mockSetLocaleMessage,
    },
  },
}));

describe('entry-server render', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockPush.mockResolvedValue(undefined);
    mockIsReady.mockResolvedValue(undefined);
    mockRenderToString.mockResolvedValue('<div id="app"></div>');
    mockHeadRender.mockReturnValue({
      headTags: '<title>Home</title>',
      bodyTags: '',
      bodyTagsOpen: '',
      htmlAttrs: '',
      bodyAttrs: '',
    });
  });

  async function getRender() {
    const mod = await import('../entry-server');
    return mod.render;
  }

  it('renders the home page with 200 status', async () => {
    const render = await getRender();
    const result = await render('/');

    expect(result.statusCode).toBe(200);
    expect(result.html).toBe('<div id="app"></div>');
    expect(result.lang).toBe('en');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('renders a known page with 200 status', async () => {
    const render = await getRender();
    const result = await render('/about');

    expect(result.statusCode).toBe(200);
    expect(mockPush).toHaveBeenCalledWith('/about');
  });

  it('returns 404 for an unknown page', async () => {
    const render = await getRender();
    const result = await render('/nonexistent');

    expect(result.statusCode).toBe(404);
  });

  it('loads locale messages when locale is provided', async () => {
    const render = await getRender();
    await render('/', 'es');

    expect(mockSetLocaleMessage).toHaveBeenCalled();
  });

  it('returns the locale as lang', async () => {
    const render = await getRender();
    const result = await render('/', 'fr');

    expect(result.lang).toBe('fr');
  });

  it('defaults lang to en when no locale provided', async () => {
    const render = await getRender();
    const result = await render('/');

    expect(result.lang).toBe('en');
  });

  it('extracts title from head payload', async () => {
    mockHeadRender.mockReturnValue({
      headTags: '<title>About Me</title>',
      bodyTags: '',
      bodyTagsOpen: '',
      htmlAttrs: '',
      bodyAttrs: '',
    });

    const render = await getRender();
    const result = await render('/about');

    expect(result.title).toBe('About Me');
  });

  it('returns empty title when head has no title tag', async () => {
    mockHeadRender.mockReturnValue({
      headTags: '<meta name="description" content="test">',
      bodyTags: '',
      bodyTagsOpen: '',
      htmlAttrs: '',
      bodyAttrs: '',
    });

    const render = await getRender();
    const result = await render('/');

    expect(result.title).toBe('');
  });

  it('returns error result when renderToString throws', async () => {
    mockRenderToString.mockRejectedValue(new Error('render failed'));

    const render = await getRender();
    const result = await render('/');

    expect(result.statusCode).toBe(500);
    expect(result.html).toContain('Failed to load page');
    expect(result.title).toBe('');
    expect(result.lang).toBe('en');
  });
});
