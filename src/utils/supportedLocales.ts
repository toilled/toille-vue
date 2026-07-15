export const SUPPORTED_LOCALES = [
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ru',
  'ar',
  'zh',
  'ja',
  'ko',
  'hi',
  'nl',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_MAP: Record<string, string> = {
  zh: 'zh-CN',
};
