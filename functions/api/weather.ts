interface WeatherContext {
  request: Request;
}

export const onRequestGet = async (_context: WeatherContext) => {
  const params = new URLSearchParams({
    latitude: '51.9001',
    longitude: '-2.0877',
    current_weather: 'true',
    hourly: 'temperature_2m,rain',
    timezone: 'Europe/London'
  });

  const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?${params}`;

  try {
    const response = await fetch(openMeteoUrl);
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
