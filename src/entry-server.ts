import { renderToString } from "vue/server-renderer";
import { createApp } from "./main";

export const onRequest = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // Try to fetch static asset first
  try {
    const assetRequest = new Request(url, {
      headers: request.headers,
    });
    // If it's a file request (has extension), try to serve it directly
    if (url.pathname.includes('.')) {
       const assetResponse = await env.ASSETS.fetch(assetRequest);
       if (assetResponse.status !== 404) {
         return assetResponse;
       }
    }
  } catch (e) {
    // Ignore errors here
  }

  // Fetch index.html template
  let template: string;
  try {
    const indexUrl = new URL("/index.html", url.origin);
    const indexResponse = await env.ASSETS.fetch(indexUrl);
    template = await indexResponse.text();
  } catch (e) {
    return new Response("Internal Error: Could not load index.html", { status: 500 });
  }

  const { app, router } = createApp();

  // Push the path to the router
  await router.push(url.pathname);
  await router.isReady();

  // Render the app
  const ctx = {};
  const appHtml = await renderToString(app, ctx);

  // Inject into template
  const html = template.replace("<!--app-html-->", appHtml);

  return new Response(html, {
    headers: {
      "content-type": "text/html",
    },
  });
};
