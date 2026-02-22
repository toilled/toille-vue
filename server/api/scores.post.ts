export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { name, score } = body as { name: string, score: number };
        const db = event.context.cloudflare?.env?.DB;

        if (!db) {
            throw createError({ statusCode: 500, statusMessage: "No Database" });
        }

        // Insert
        await db.prepare(
            "INSERT INTO scores (name, score, date) VALUES (?, ?, ?)"
        ).bind(name, score, new Date().toISOString()).run();

        // Return new top 5
        const { results } = await db.prepare(
            "SELECT name, score FROM scores ORDER BY score DESC LIMIT 5"
        ).all();
        return results;
    } catch (err: any) {
        throw createError({
            statusCode: 500,
            statusMessage: err.message
        });
    }
});
