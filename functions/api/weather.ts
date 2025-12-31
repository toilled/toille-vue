export const onRequestGet = async () => {
    try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=51.9001&longitude=-2.0877&current_weather=true&hourly=temperature_2m,rain&timezone=Europe%2FLondon';
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`External API error: ${response.status}`);
        }

        const data: any = await response.json();
        const currentHourStr = new Date().toISOString().slice(0, 13);
        const hourly = data.hourly;

        // Find index of current hour
        let startIndex = hourly.time.findIndex((t: string) => t.startsWith(currentHourStr));
        if (startIndex === -1) startIndex = 0; // Fallback

        // Get minimal dataset (next 12 hours) to send to client
        const next12: any[] = [];
        const limit = Math.min(startIndex + 12, hourly.time.length);

        for (let i = startIndex; i < limit; i++) {
            next12.push({
                time: hourly.time[i],
                temp: hourly.temperature_2m[i],
                rain: hourly.rain ? hourly.rain[i] : 0
            });
        }

        const result = {
            current_weather: data.current_weather,
            hourly: next12
        };

        return new Response(JSON.stringify(result), {
            headers: {
                'Content-Type': 'application/json',
                // Cache for 15 minutes prevents hitting external API on every page load
                'Cache-Control': 'public, max-age=900'
            }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
