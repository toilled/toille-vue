// @ts-expect-error ssr-app.js is a bundled module without types
import { render } from "./ssr-app.js";

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=51.9001&longitude=-2.0877&current_weather=true&hourly=temperature_2m,rain&timezone=Europe%2FLondon';
const WEATHER_CACHE_KEY = 'weather:open-meteo:cheltenham';
const WEATHER_CACHE_TTL = 15 * 60;

interface RequestContext {
  request: Request;
  env: {
    ASSETS?: { fetch: (request: Request) => Promise<Response> };
  };
  next: () => Promise<Response>;
  waitUntil: (promise: Promise<unknown>) => void;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleWeatherRequest(context: RequestContext): Promise<Response> {
  const cache = caches.default;

  const cached = await cache.match(WEATHER_CACHE_KEY);
  if (cached) {
    return cached;
  }

  try {
    const res = await fetch(WEATHER_URL);
    if (!res.ok) {
      return json({ error: 'Weather API error' }, 502);
    }

    const data = await res.json();

    const response = new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${WEATHER_CACHE_TTL}`,
      },
    });

    context.waitUntil(cache.put(WEATHER_CACHE_KEY, response.clone()));

    return response;
  } catch {
    return json({ error: 'Failed to fetch weather' }, 502);
  }
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

  if (url.pathname === '/api/weather') {
    return handleWeatherRequest(context);
  }

  try {
    return await handleSsrRequest(url, context);
  } catch (error) {
    console.error("SSR Error:", error);
    return context.next();
  }
};
