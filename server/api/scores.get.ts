export default defineEventHandler(async (event) => {
    try {
        const db = event.context.cloudflare?.env?.DB;
        if (!db) {
            // Local fallback or error handling
            // console.warn("No Database binding found");
            return [];
        }
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
