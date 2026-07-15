import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import { SUPPORTED_LOCALES, LOCALE_MAP, type SupportedLocale } from './utils/supportedLocales';
import { setI18nInstance, loadLocale } from './utils/loadLocale';

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
    if (LOCALE_MAP[normalized]) return LOCALE_MAP[normalized];
    if (SUPPORTED_LOCALES.includes(normalized as SupportedLocale)) return normalized;
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

setI18nInstance(i18n);

if (typeof window !== 'undefined') {
  loadLocale(getInitialLocale());
}

export default i18n;
