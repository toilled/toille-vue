// @ts-ignore
import { render } from "./ssr-app.js";

export const onRequest = async (context: any) => {
  const url = new URL(context.request.url);

  // Serve static assets directly
  if (/\.[a-zA-Z0-9]+$/.test(url.pathname)) {
    return context.next();
  }

  try {
    // 1. Render app state
    // Check if the route is valid via the app's router logic or just let the app render.
    // However, SSR rendering might be async.
    const appHtml = await render(url.pathname);

    // 2. Get the index.html template
    let response = await context.next();

    // If upstream (static asset) returns 404, we might still want to serve index.html with the app rendered,
    // unless it's a true 404 for a static asset.
    // For SPA, usually index.html serves everything.

    let template = "";
    if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
        template = await response.text();
    } else {
        // Try fetching index.html explicitly
        if (context.env && context.env.ASSETS) {
            const indexRequest = new Request(new URL("/index.html", url.origin), context.request);
            const indexResponse = await context.env.ASSETS.fetch(indexRequest);
            if (indexResponse.ok) {
                template = await indexResponse.text();
                // We are serving the app, so status 200 is generally appropriate for client-side routing,
                // even if the specific route is 404 in the app logic (the client app handles that).
                response = new Response(response.body, { ...response, status: 200 });
            } else {
                return response;
            }
        } else {
            // If we can't find index.html, we can't SSR into it.
            return response;
        }
    }

    // Inject the rendered HTML
    // Make sure we replace the correct placeholder.
    // Usually standard vite apps use <div id="app"></div> but here we might want to replace innerHTML.
    // Or replace a comment <!--app-html--> if it exists.

    // In `index.html`, we expect `<div id="app"></div>` or `<!--app-html-->`.
    // Let's assume standard Vite index.html which has <div id="app"></div>.
    // We want to insert inside it.

    let html = template;
    if (template.includes('<!--app-html-->')) {
        html = template.replace('<!--app-html-->', appHtml);
    } else if (template.includes('<div id="app">')) {
        html = template.replace('<div id="app">', `<div id="app">${appHtml}`);
    }

    return new Response(html, {
      headers: {
          ...Object.fromEntries(response.headers),
          'content-type': 'text/html;charset=UTF-8'
      },
      status: response.status === 404 ? 200 : response.status, // SPA fallback
    });

  } catch (error) {
    console.error('SSR Error:', error);
    // Fallback to client-side rendering (return original template without replacement)
    return context.next();
  }
};
