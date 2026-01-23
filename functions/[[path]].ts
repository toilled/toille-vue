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
    const appHtml = await render(url.pathname);

    // 2. Get the index.html template
    let response = await context.next();

    // Check if we got a valid HTML response (index.html or similar)
    // If it's a 404, it might be that the static file doesn't exist, but we want to render the app anyway (SPA route).
    // In many Pages setups, 404 is the default for non-existent files.

    let template = "";
    if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
        template = await response.text();
    } else {
        // Try fetching index.html explicitly if the route returned 404 (e.g. /about)
        if (context.env && context.env.ASSETS) {
            const indexRequest = new Request(new URL("/index.html", url.origin), context.request);
            const indexResponse = await context.env.ASSETS.fetch(indexRequest);
            if (indexResponse.ok) {
                template = await indexResponse.text();
                // Fix status code to 200 since we found the app
                response = new Response(response.body, { ...response, status: 200 });
            } else {
                return response;
            }
        } else {
            return response;
        }
    }

    const html = template.replace('<!--app-html-->', appHtml);

    return new Response(html, {
      headers: {
          ...Object.fromEntries(response.headers),
          'content-type': 'text/html;charset=UTF-8'
      },
      status: 200,
    });

  } catch (error) {
    console.error('SSR Error:', error);
    // Fallback to client-side rendering (return original template without replacement)
    return context.next();
  }
};
