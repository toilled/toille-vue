import { createI18n } from 'vue-i18n';
import en from './locales/en.json';

type MessageSchema = typeof en;

function getInitialLocale(): string {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return 'en';
  }
  const stored = localStorage.getItem('locale');
  if (stored) return stored;
  const browserLangs = navigator.languages || [navigator.language];
  for (const lang of browserLangs) {
    const normalized = lang.split('-')[0];
    const supported = [
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
    if (normalized === 'zh') return 'zh-CN';
    if (supported.includes(normalized)) return normalized;
  }
  return 'en';
}

const i18n = createI18n<[MessageSchema], string>({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  warnHtmlMessage: false,
  messages: { en },
});

export function loadLocale(locale: string) {
  const loaders: Record<string, () => Promise<{ default: MessageSchema }>> = {
    es: () => import('./locales/es.json'),
    fr: () => import('./locales/fr.json'),
    de: () => import('./locales/de.json'),
    it: () => import('./locales/it.json'),
    pt: () => import('./locales/pt.json'),
    ru: () => import('./locales/ru.json'),
    ar: () => import('./locales/ar.json'),
    'zh-CN': () => import('./locales/zh-CN.json'),
    ja: () => import('./locales/ja.json'),
    ko: () => import('./locales/ko.json'),
    hi: () => import('./locales/hi.json'),
    nl: () => import('./locales/nl.json'),
  };
  if (loaders[locale] && locale !== 'en') {
    loaders[locale]().then((msgs) => {
      i18n.global.setLocaleMessage(locale, msgs.default);
    });
  }
}

if (typeof window !== 'undefined') {
  loadLocale(getInitialLocale());
}

export default i18n;
