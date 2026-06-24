import { useI18n } from 'vue-i18n';

const cache = new Map<string, string>();

export function useTranslate() {
  const { locale } = useI18n();

  async function translate(text: string, source = 'en'): Promise<string> {
    if (!text) return text;
    const target = locale.value;
    if (target === source) return text;

    const cacheKey = `${source}:${target}:${text}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;

    if (import.meta.env.SSR) return text;

    try {
      const baseUrl =
        import.meta.env.VITE_TRANSLATE_API_URL || 'https://api.mymemory.translated.net/get';
      const url = `${baseUrl}?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${source}|${target}`;
      const response = await fetch(url);
      const data = await response.json();
      const result = data?.responseData?.translatedText;
      if (result && typeof result === 'string') {
        cache.set(cacheKey, result);
        return result;
      }
    } catch {
      // Translation API error; fall through to return original
    }
    return text;
  }

  return { translate, locale };
}
