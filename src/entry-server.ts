import { renderToString } from "@vue/server-renderer";
import { createApp } from "./main";

export async function render(url: string) {
  const { app, router } = createApp();

  await router.push(url);
  await router.isReady();

  const matchedRoutes = router.currentRoute.value.matched;
  const isNotFound = matchedRoutes.length > 0 && matchedRoutes[matchedRoutes.length - 1].path === "/:pathMatch(.*)*";
  const statusCode = isNotFound ? 404 : 200;

  const ctx = {};
  const html = await renderToString(app, ctx);

  return { html, statusCode };
}
