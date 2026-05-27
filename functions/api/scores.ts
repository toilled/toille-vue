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

interface ScoreContext {
  env: {
    DB: {
      prepare: (sql: string) => {
        all: () => Promise<{ results: ScoreEntry[] }>;
        bind: (...values: unknown[]) => { run: () => Promise<void> };
      };
    };
  };
  request: Request;
}

interface ScoreEntry {
  name: string;
  score: number;
}

export const onRequestGet = async (context: ScoreContext) => {
  try {
    const db = context.env.DB;
    if (!db) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      });
    }
    const { results } = (await db
      .prepare("SELECT name, score FROM scores ORDER BY score DESC LIMIT 5")
      .all()) as { results: ScoreEntry[] };
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const onRequestPost = async (context: ScoreContext) => {
  try {
    const { name, score } = (await context.request.json()) as {
      name: string;
      score: number;
    };
    const db = context.env.DB;

    if (!db)
      return new Response(JSON.stringify({ error: "No Database" }), {
        status: 500,
      });

    await db
      .prepare("INSERT INTO scores (name, score, date) VALUES (?, ?, ?)")
      .bind(name, score, new Date().toISOString())
      .run();

    const { results } = (await db
      .prepare("SELECT name, score FROM scores ORDER BY score DESC LIMIT 5")
      .all()) as { results: ScoreEntry[] };
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
