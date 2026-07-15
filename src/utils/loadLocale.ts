// eslint-disable-next-line @typescript-eslint/no-explicit-any
let i18nInstance: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setI18nInstance(instance: any): void {
  i18nInstance = instance;
}

const localeLoaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  es: () => import('../locales/es.json'),
  fr: () => import('../locales/fr.json'),
  de: () => import('../locales/de.json'),
  it: () => import('../locales/it.json'),
  pt: () => import('../locales/pt.json'),
  ru: () => import('../locales/ru.json'),
  ar: () => import('../locales/ar.json'),
  'zh-CN': () => import('../locales/zh-CN.json'),
  ja: () => import('../locales/ja.json'),
  ko: () => import('../locales/ko.json'),
  hi: () => import('../locales/hi.json'),
  nl: () => import('../locales/nl.json'),
};

export function loadLocale(locale: string): Promise<void> | void {
  if (i18nInstance && localeLoaders[locale] && locale !== 'en') {
    return localeLoaders[locale]().then((msgs) => {
      i18nInstance!.global.setLocaleMessage(locale, msgs.default);
    });
  }
}
