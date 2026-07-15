import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');
const templatePath = join(distDir, 'index.html');
const template = readFileSync(templatePath, 'utf-8');

const ssrBundlePath = resolve(__dirname, '../functions/ssr-app.js');
const { render } = await import(pathToFileURL(ssrBundlePath).href);

function pathToFileURL(p) {
  return new URL(`file://${p}`);
}

const pages = JSON.parse(readFileSync(resolve(__dirname, '../src/configs/pages.json'), 'utf-8'));
const ssgRoutes = pages.map((p) => p.link);

const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'zh-CN', 'ja', 'ko', 'hi', 'nl'];

let generated = 0;

for (const locale of locales) {
  for (const route of ssgRoutes) {
    const { html: appHtml, title, lang } = await render(route, locale);

    let html = template.replace('<!--app-html-->', appHtml);
    html = html.replace('lang="en"', `lang="${lang}"`);
    html = html.replace('<title>Elliot Dickerson</title>', `<title>${title}</title>`);

    let outPath;
    if (route === '/') {
      outPath = locale === 'en'
        ? join(distDir, 'index.html')
        : join(distDir, locale, 'index.html');
    } else {
      outPath = locale === 'en'
        ? join(distDir, route.slice(1), 'index.html')
        : join(distDir, locale, route.slice(1), 'index.html');
    }

    const dir = dirname(outPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(outPath, html, 'utf-8');
    generated++;
  }
}

console.log(`SSG: Generated ${generated} static pages (${locales.length} locales × ${ssgRoutes.length} routes)`);
