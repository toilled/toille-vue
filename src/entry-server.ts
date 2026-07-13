import { renderToString } from '@vue/server-renderer';
import { createApp } from './main';
import { createHead } from '@unhead/vue/server';
import i18n from './i18n';
import rawPages from './configs/pages.json';

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

const localeMessages: Record<string, Record<string, unknown>> = {
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
};

const pages = rawPages as { link: string }[];
const validPageLinks = new Set(pages.map((p) => p.link));

function isKnownPage(pathname: string): boolean {
  if (validPageLinks.has(pathname)) return true;
  const name = pathname.replace(/^\//, '');
  return validPageLinks.has('/' + name);
}

export async function render(url: string, locale?: string) {
  try {
    if (locale && locale !== 'en' && localeMessages[locale]) {
      i18n.global.setLocaleMessage(locale, localeMessages[locale]);
    }

    const head = createHead();
    const { app, router } = createApp(head, true);

    if (locale) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const appI18n = app.config.globalProperties.$i18n as any;
      if (appI18n?.locale) {
        if (typeof appI18n.locale === 'object' && 'value' in appI18n.locale) {
          appI18n.locale.value = locale;
        } else {
          appI18n.locale = locale;
        }
      }
    }

    await router.push(url);
    await router.isReady();

    const pathname = new URL(url, 'http://localhost').pathname;
    const statusCode = isKnownPage(pathname) ? 200 : 404;

    const ctx = {};
    const html = await renderToString(app, ctx);

    return { html, statusCode };
  } catch (err) {
    console.error('SSR render error:', err);
    return {
      html: '<div id="app"><p>Failed to load page. Please try again.</p></div>',
      statusCode: 500,
    };
  }
}
