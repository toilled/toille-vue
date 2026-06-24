import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import zhCN from './locales/zh-CN.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import hi from './locales/hi.json';
import nl from './locales/nl.json';

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

export default createI18n<
  [MessageSchema],
  'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ar' | 'zh-CN' | 'ja' | 'ko' | 'hi' | 'nl'
>({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  warnHtmlMessage: false,
  messages: {
    en,
    es,
    fr,
    de,
    it,
    pt,
    ru,
    ar,
    'zh-CN': zhCN,
    ja,
    ko,
    hi,
    nl,
  },
});
