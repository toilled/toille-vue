// @ts-expect-error ssr-app.js is a bundled module without types
import { render } from "./ssr-app.js";

interface RequestContext {
  request: Request;
  env: {
    ASSETS?: { fetch: (request: Request) => Promise<Response> };
  };
  next: () => Promise<Response>;
}

function isHtmlResponse(response: Response) {
  return response.ok && response.headers.get("content-type")?.includes("text/html");
}

async function tryFetchIndexHtml(url: URL, context: RequestContext) {
  if (!context.env?.ASSETS) return null;
  const req = new Request(new URL("/index.html", url.origin), context.request);
  const res = await context.env.ASSETS.fetch(req);
  if (!res.ok) return null;
  const template = await res.text();
  return { template, headers: new Headers(res.headers) };
}

async function handleSsrRequest(url: URL, context: RequestContext) {
  const { html: appHtml, statusCode } = await render(url.pathname);
  const response = await context.next();

  let htmlResult: { template: string; headers: Headers } | null = null;

  if (isHtmlResponse(response)) {
    const template = await response.text();
    htmlResult = { template, headers: new Headers(response.headers) };
  } else {
    htmlResult = await tryFetchIndexHtml(url, context);
  }

  if (!htmlResult) return response;

  const html = htmlResult.template.replace("<!--app-html-->", appHtml);
  htmlResult.headers.set("content-type", "text/html;charset=UTF-8");
  htmlResult.headers.set("cache-control", "public, max-age=0, must-revalidate");

  return new Response(html, { headers: htmlResult.headers, status: statusCode });
}

export const onRequest = async (context: RequestContext) => {
  const url = new URL(context.request.url);

  if (/\.[a-zA-Z0-9]+$/.test(url.pathname)) {
    return context.next();
  }

  try {
    return await handleSsrRequest(url, context);
  } catch (error) {
    console.error("SSR Error:", error);
    return context.next();
  }
};
