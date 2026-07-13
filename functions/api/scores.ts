interface Env {
  DB: {
    prepare: (sql: string) => {
      all: () => Promise<{ results: ScoreEntry[] }>;
      bind: (...values: unknown[]) => { run: () => Promise<void>; first: () => Promise<Record<string, unknown> | null> };
    };
  };
}

interface ScoreContext {
  env: Env;
  request: Request;
}

interface ScoreEntry {
  name: string;
  score: number;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 500): Response {
  return json({ error: message }, status);
}

function getDB(env: Env): Env["DB"] | null {
  return env.DB || null;
}

async function handleCreateAction(db: Env["DB"]): Promise<Response> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db
    .prepare("INSERT INTO game_sessions (id, created_at, status, checkpoints) VALUES (?, ?, 'active', 0)")
    .bind(id, createdAt)
    .run();
  return json({ game_id: id });
}

async function handleCheckpointAction(db: Env["DB"], gameId: string): Promise<Response> {
  if (!gameId) {
    return errorResponse("Missing game_id", 400);
  }
  await db
    .prepare("UPDATE game_sessions SET checkpoints = checkpoints + 1 WHERE id = ? AND status = 'active'")
    .bind(gameId)
    .run();
  return json({ ok: true });
}

function parseSubmitBody(body: Record<string, unknown>): { gameId: string; name: string; score: number } | null {
  const { game_id: gameId, name, score } = body as Record<string, unknown>;
  if (gameId && name && typeof score === "number") {
    return { gameId: gameId as string, name: name as string, score };
  }
  return null;
}

async function getSession(db: Env["DB"], gameId: string) {
  return db
    .prepare("SELECT id, status, checkpoints FROM game_sessions WHERE id = ?")
    .bind(gameId)
    .first();
}

async function validateSession(
  db: Env["DB"],
  gameId: string,
): Promise<Response | { checkpoints: number }> {
  const session = await getSession(db, gameId);
  if (!session) return errorResponse("Invalid game session", 400);
  if (session.status !== "active") return errorResponse("Session already used", 400);
  return { checkpoints: (session.checkpoints as number) || 0 };
}

async function handleSubmitAction(
  db: Env["DB"],
  body: Record<string, unknown>,
): Promise<Response> {
  const parsed = parseSubmitBody(body);
  if (!parsed) {
    return errorResponse("Missing required fields", 400);
  }

  const { gameId, name, score } = parsed;
  const valid = await validateSession(db, gameId);
  if (valid instanceof Response) return valid;

  const recordedCheckpoints = valid.checkpoints;
  const serverComputedMax = recordedCheckpoints * 500 + 500;
  const finalScore = Math.min(score, serverComputedMax);

  await db
    .prepare("UPDATE game_sessions SET status = 'submitted', score = ? WHERE id = ?")
    .bind(finalScore, gameId)
    .run();

  await db
    .prepare("INSERT INTO scores (name, score, date) VALUES (?, ?, ?)")
    .bind(name, finalScore, new Date().toISOString())
    .run();

  const { results } = (await db
    .prepare("SELECT name, score FROM scores ORDER BY score DESC LIMIT 5")
    .all()) as { results: ScoreEntry[] };
  return json(results);
}

async function handleError(err: unknown): Promise<Response> {
  const message = err instanceof Error ? err.message : "Unknown error";
  return errorResponse(message);
}

export const onRequestGet = async (context: ScoreContext) => {
  try {
    const db = getDB(context.env);
    if (!db) {
      return json([]);
    }
    const { results } = (await db
      .prepare("SELECT name, score FROM scores ORDER BY score DESC LIMIT 5")
      .all()) as { results: ScoreEntry[] };
    return json(results);
  } catch (err) {
    return handleError(err);
  }
};

async function routeAction(
  db: Env["DB"],
  action: string,
  body: Record<string, unknown>,
): Promise<Response> {
  switch (action) {
    case "create":
      return handleCreateAction(db);
    case "checkpoint":
      return handleCheckpointAction(db, body.game_id as string);
    case "submit":
      return handleSubmitAction(db, body);
    default:
      return errorResponse("Unknown action", 400);
  }
}

export const onRequestPost = async (context: ScoreContext) => {
  try {
    const db = getDB(context.env);
    if (!db) {
      return errorResponse("No Database");
    }
    const body = (await context.request.json()) as Record<string, unknown>;
    return routeAction(db, body.action as string, body);
  } catch (err) {
    return handleError(err);
  }
};
