const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=51.9001&longitude=-2.0877&current_weather=true&hourly=temperature_2m,rain&timezone=Europe%2FLondon';
const CACHE_KEY = 'weather:open-meteo:cheltenham';
const CACHE_TTL = 15 * 60;

interface WeatherContext {
  waitUntil: (promise: Promise<unknown>) => void;
}

async function handleWeatherRequest(context: WeatherContext): Promise<Response> {
  const cache = caches.default;

  const cached = await cache.match(CACHE_KEY);
  if (cached) {
    return cached;
  }

  try {
    const res = await fetch(WEATHER_URL);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Weather API error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();

    const response = new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
      },
    });

    context.waitUntil(cache.put(CACHE_KEY, response.clone()));

    return response;
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch weather' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const onRequest: (context: WeatherContext) => Promise<Response> = handleWeatherRequest;
