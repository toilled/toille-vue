export const loaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
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
