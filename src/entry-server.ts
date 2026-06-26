import { renderToString } from '@vue/server-renderer';
import { createApp } from './main';
import { createHead } from '@unhead/vue/server';

export async function render(url: string) {
  try {
    const head = createHead();
    const { app, router } = createApp(head, true);

    await router.push(url);
    await router.isReady();

    const matchedRoutes = router.currentRoute.value.matched;
    const isNotFound =
      matchedRoutes.length > 0 &&
      matchedRoutes[matchedRoutes.length - 1].path === '/:pathMatch(.*)*';
    const statusCode = isNotFound ? 404 : 200;

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
