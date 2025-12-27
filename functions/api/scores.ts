/*
  Cloudflare Pages Function for Scoreboard
  Requires a D1 Database binding named 'DB'
  
  Schema:
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT, 
    score INTEGER, 
    date TEXT
  );
*/

interface Env {
    DB: any; // D1Database
}

export const onRequestGet = async (context: any) => {
    try {
        const db = context.env.DB;
        if (!db) {
            return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
        }
        const { results } = await db.prepare(
            "SELECT name, score FROM scores ORDER BY score DESC LIMIT 5"
        ).all();
        return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export const onRequestPost = async (context: any) => {
    try {
        const { name, score } = await context.request.json() as { name: string, score: number };
        const db = context.env.DB;

        if (!db) {
            return new Response(JSON.stringify({
                error: "No Database",
                envKeys: Object.keys(context.env || {})
            }), { status: 500 });
        }

        // Insert
        await db.prepare(
            "INSERT INTO scores (name, score, date) VALUES (?, ?, ?)"
        ).bind(name, score, new Date().toISOString()).run();

        // Return new top 5
        const { results } = await db.prepare(
            "SELECT name, score FROM scores ORDER BY score DESC LIMIT 5"
        ).all();
        return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
