import { renderToString, type SSRContext } from '@vue/server-renderer';
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

function loadLocaleMessage(locale: string): void {
  if (locale !== 'en' && localeMessages[locale]) {
    i18n.global.setLocaleMessage(locale, localeMessages[locale]);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function configureAppLocale(app: any, locale: string): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const i18n = app.config.globalProperties.$i18n as any;
  if (!i18n?.locale) return;
  if (typeof i18n.locale === 'object') {
    i18n.locale.value = locale;
  } else {
    i18n.locale = locale;
  }
}

function extractTitle(headPayload: { headTags: string }): string {
  const match = headPayload.headTags.match(/<title[^>]*>([^<]+)<\/title>/);
  return match?.[1] ?? '';
}

function getStatusCode(pathname: string): number {
  return isKnownPage(pathname) ? 200 : 404;
}

export async function render(url: string, locale?: string) {
  try {
    const head = createHead();
    const { app, router } = createApp(head, true);

    if (locale) {
      loadLocaleMessage(locale);
      configureAppLocale(app, locale);
    }

    await router.push(url);
    await router.isReady();

    const pathname = new URL(url, 'http://localhost').pathname;
    const context: SSRContext = {};
    const html = await renderToString(app, context);
    const title = extractTitle(head.render());

    return {
      html,
      statusCode: getStatusCode(pathname),
      title,
      lang: locale ?? 'en',
      teleports: context.teleports ?? {},
    };
  } catch (err) {
    console.error('SSR render error:', err);
    return {
      html: '<div id="app"><p>Failed to load page. Please try again.</p></div>',
      statusCode: 500,
      title: '',
      lang: 'en',
      teleports: {},
    };
  }
}
