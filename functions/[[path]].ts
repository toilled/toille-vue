// @ts-expect-error ssr-app.js is a bundled module without types
import { render } from "./ssr-app.js";

interface RequestContext {
  request: Request;
  env: {
    ASSETS?: { fetch: (request: Request) => Promise<Response> };
  };
  next: () => Promise<Response>;
}

export const onRequest = async (context: RequestContext) => {
  const url = new URL(context.request.url);

  // Serve static assets directly
  if (/\.[a-zA-Z0-9]+$/.test(url.pathname)) {
    return context.next();
  }

  try {
    // 1. Render app state
    const appHtml = await render(url.pathname);

    // 2. Get the index.html template
    const response = await context.next();
    let headers = new Headers();
    let template = "";

    // Check if we got a valid HTML response (index.html or similar)
    if (
      response.ok &&
      response.headers.get("content-type")?.includes("text/html")
    ) {
      template = await response.text();
      headers = new Headers(response.headers);
    } else {
      // Try fetching index.html explicitly if the route returned 404 (e.g. /about)
      if (context.env && context.env.ASSETS) {
        const indexRequest = new Request(
          new URL("/index.html", url.origin),
          context.request,
        );
        const indexResponse = await context.env.ASSETS.fetch(indexRequest);
        if (indexResponse.ok) {
          template = await indexResponse.text();
          headers = new Headers(indexResponse.headers);
        } else {
          return response;
        }
      } else {
        return response;
      }
    }

    const html = template.replace("<!--app-html-->", appHtml);

    headers.set("content-type", "text/html;charset=UTF-8");
    headers.set("cache-control", "public, max-age=0, must-revalidate");

    return new Response(html, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error("SSR Error:", error);
    // Fallback to client-side rendering (return original template without replacement)
    return context.next();
  }
};
