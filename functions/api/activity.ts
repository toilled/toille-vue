export const onRequestGet = async () => {
    try {
        const response = await fetch('https://bored.api.lewagon.com/api/activity');

        if (!response.ok) {
            throw new Error(`External API error: ${response.status}`);
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                // No caching for activities as the user wants a random one each time
                'Cache-Control': 'no-store'
            }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
