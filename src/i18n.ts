import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import { loaders } from './i18n-loaders';

type MessageSchema = typeof en;

const SUPPORTED_LOCALES = [
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
];

function findBrowserLocale(): string | null {
  const browserLangs = navigator.languages || [navigator.language];
  for (const lang of browserLangs) {
    const normalized = lang.split('-')[0];
    if (normalized === 'zh') return 'zh-CN';
    if (SUPPORTED_LOCALES.includes(normalized)) return normalized;
  }
  return null;
}

export function getInitialLocale(): string {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return 'en';
  }
  const stored = localStorage.getItem('locale');
  if (stored) return stored;
  return findBrowserLocale() ?? 'en';
}

export const i18nConfig = {
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  warnHtmlMessage: false,
  messages: { en },
} as const;

export async function loadLocale(locale: string): Promise<void> {
  if (locale !== 'en' && loaders[locale]) {
    return loaders[locale]().then((msgs) => {
      i18n.global.setLocaleMessage(locale, msgs.default);
    });
  }
}

export const i18n = createI18n<[MessageSchema], string>(i18nConfig);

if (typeof window !== 'undefined') {
  loadLocale(getInitialLocale());
}

export default i18n;
