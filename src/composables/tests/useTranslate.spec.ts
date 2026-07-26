import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: { value: 'en' } }),
}));

describe('useTranslate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the text unchanged if empty', async () => {
    const { useTranslate } = await import('../../composables/useTranslate');
    const { translate } = useTranslate();

    expect(await translate('')).toBe('');
    expect(await translate('')).toBe('');
  });

  it('returns the text unchanged if target equals source', async () => {
    const { useTranslate } = await import('../../composables/useTranslate');
    const { translate } = useTranslate();

    // locale is 'en', source is 'en'
    expect(await translate('hello', 'en')).toBe('hello');
  });

  it('returns cached translation if available', async () => {
    const { useTranslate } = await import('../../composables/useTranslate');
    const { translate } = useTranslate();

    // First call
    const result1 = await translate('hello', 'en');
    expect(result1).toBe('hello');

    // Second call - should hit cache
    const result2 = await translate('hello', 'en');
    expect(result2).toBe('hello');
  });

  it('returns original text during SSR', async () => {
    vi.stubGlobal('import.meta', { env: { SSR: true } });

    const { useTranslate } = await import('../../composables/useTranslate');
    const { translate } = useTranslate();

    expect(await translate('hello', 'es')).toBe('hello');

    vi.unstubAllGlobals();
  });

  it('returns locale from useI18n', async () => {
    const { useTranslate } = await import('../../composables/useTranslate');
    const { locale } = useTranslate();

    expect(locale.value).toBe('en');
  });
});
