import { describe, it, expect, vi, beforeEach } from 'vitest';

interface Env {
  DB: {
    prepare: (sql: string) => {
      all: () => Promise<{ results: ScoreEntry[] }>;
      bind: (...values: unknown[]) => {
        run: () => Promise<void>;
        first: () => Promise<Record<string, unknown> | null>;
      };
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
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 500): Response {
  return json({ error: message }, status);
}

function getDB(env: Env): Env['DB'] | null {
  return env.DB || null;
}

async function handleCreateAction(db: Env['DB']): Promise<Response> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO game_sessions (id, created_at, status, checkpoints) VALUES (?, ?, 'active', 0)"
    )
    .bind(id, createdAt)
    .run();
  return json({ game_id: id });
}

async function handleCheckpointAction(db: Env['DB'], gameId: string): Promise<Response> {
  if (!gameId) {
    return errorResponse('Missing game_id', 400);
  }
  await db
    .prepare(
      "UPDATE game_sessions SET checkpoints = checkpoints + 1 WHERE id = ? AND status = 'active'"
    )
    .bind(gameId)
    .run();
  return json({ ok: true });
}

function parseSubmitBody(
  body: Record<string, unknown>
): { gameId: string; name: string; score: number } | null {
  const { game_id: gameId, name, score } = body as Record<string, unknown>;
  if (gameId && name && typeof score === 'number') {
    return { gameId: gameId as string, name: name as string, score };
  }
  return null;
}

async function getSession(db: Env['DB'], gameId: string) {
  return db
    .prepare('SELECT id, status, checkpoints FROM game_sessions WHERE id = ?')
    .bind(gameId)
    .first();
}

async function validateSession(
  db: Env['DB'],
  gameId: string
): Promise<Response | { checkpoints: number }> {
  const session = await getSession(db, gameId);
  if (!session) return errorResponse('Invalid game session', 400);
  if (session.status !== 'active') return errorResponse('Session already used', 400);
  return { checkpoints: (session.checkpoints as number) || 0 };
}

async function handleSubmitAction(db: Env['DB'], body: Record<string, unknown>): Promise<Response> {
  const parsed = parseSubmitBody(body);
  if (!parsed) {
    return errorResponse('Missing required fields', 400);
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
    .prepare('INSERT INTO scores (name, score, date) VALUES (?, ?, ?)')
    .bind(name, finalScore, new Date().toISOString())
    .run();

  const { results } = (await db
    .prepare('SELECT name, score FROM scores ORDER BY score DESC LIMIT 5')
    .all()) as { results: ScoreEntry[] };
  return json(results);
}

async function handleError(err: unknown): Promise<Response> {
  const message = err instanceof Error ? err.message : 'Unknown error';
  return errorResponse(message);
}

const onRequestGet = async (context: ScoreContext) => {
  try {
    const db = getDB(context.env);
    if (!db) {
      return json([]);
    }
    const { results } = (await db
      .prepare('SELECT name, score FROM scores ORDER BY score DESC LIMIT 5')
      .all()) as { results: ScoreEntry[] };
    return json(results);
  } catch (err) {
    return handleError(err);
  }
};

async function routeAction(
  db: Env['DB'],
  action: string,
  body: Record<string, unknown>
): Promise<Response> {
  switch (action) {
    case 'create':
      return handleCreateAction(db);
    case 'checkpoint':
      return handleCheckpointAction(db, body.game_id as string);
    case 'submit':
      return handleSubmitAction(db, body);
    default:
      return errorResponse('Unknown action', 400);
  }
}

const onRequestPost = async (context: ScoreContext) => {
  try {
    const db = getDB(context.env);
    if (!db) {
      return errorResponse('No Database');
    }
    const body = (await context.request.json()) as Record<string, unknown>;
    return routeAction(db, body.action as string, body);
  } catch (err) {
    return handleError(err);
  }
};

function createMockDB() {
  const store: {
    scores: { name: string; score: number; date: string }[];
    sessions: {
      id: string;
      created_at: string;
      status: string;
      checkpoints: number;
      score: number;
    }[];
  } = { scores: [], sessions: [] };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const prepared: any = {
    bind: vi.fn((..._values: unknown[]) => ({
      run: vi.fn(async () => {
        const sql = prepared._lastSql;
        if (sql.includes('INSERT INTO game_sessions')) {
          store.sessions.push({
            id: _values[0] as string,
            created_at: _values[1] as string,
            status: 'active',
            checkpoints: 0,
            score: 0,
          });
        } else if (sql.includes('UPDATE game_sessions SET checkpoints')) {
          const session = store.sessions.find((s) => s.id === _values[0]);
          if (session && session.status === 'active') session.checkpoints++;
        } else if (sql.includes('UPDATE game_sessions SET status')) {
          const session = store.sessions.find((s) => s.id === _values[1]);
          if (session) {
            session.status = 'submitted';
            session.score = _values[0] as number;
          }
        } else if (sql.includes('INSERT INTO scores')) {
          store.scores.push({
            name: _values[0] as string,
            score: _values[1] as number,
            date: _values[2] as string,
          });
        }
      }),
      first: vi.fn(async () => {
        const sql = prepared._lastSql;
        if (sql.includes('SELECT')) {
          if (sql.includes('game_sessions')) {
            const gameId = _values[0];
            const session = store.sessions.find((s) => s.id === gameId);
            if (!session) return null;
            return session;
          }
          return null;
        }
        return null;
      }),
    })),
    _lastSql: '',
    all: vi.fn(async () => {
      const top = [...store.scores].sort((a, b) => b.score - a.score).slice(0, 5);
      return { results: top.map(({ name, score }) => ({ name, score })) };
    }),
  };

  const DB = {
    prepare: vi.fn((sql: string) => {
      prepared._lastSql = sql;
      return prepared;
    }),
  };

  return { DB, store };
}

function createRequest(method: string, body?: Record<string, unknown>): Request {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new Request('http://localhost/api/scores', init);
}

describe('Scores API handler functions', () => {
  let mockDB: ReturnType<typeof createMockDB>;

  beforeEach(() => {
    mockDB = createMockDB();
    vi.clearAllMocks();
  });

  describe('GET /api/scores', () => {
    it('returns top scores from database', async () => {
      mockDB.store.scores.push(
        { name: 'ACE', score: 1000, date: '2026-01-01' },
        { name: 'BOB', score: 500, date: '2026-01-02' }
      );

      const request = createRequest('GET');
      const response = await onRequestGet({ env: { DB: mockDB.DB }, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([
        { name: 'ACE', score: 1000 },
        { name: 'BOB', score: 500 },
      ]);
    });

    it('returns empty array when no database', async () => {
      const request = createRequest('GET');
      const response = await onRequestGet({
        env: { DB: undefined as never },
        request,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('returns error when database throws', async () => {
      mockDB.DB.prepare.mockImplementation(() => {
        throw new Error('DB connection failed');
      });

      const request = createRequest('GET');
      const response = await onRequestGet({ env: { DB: mockDB.DB }, request });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'DB connection failed' });
    });
  });

  describe('POST /api/scores - create action', () => {
    it('creates a new game session', async () => {
      const request = createRequest('POST', { action: 'create' });
      const response = await onRequestPost({ env: { DB: mockDB.DB }, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.game_id).toBeDefined();
      expect(typeof data.game_id).toBe('string');
      expect(mockDB.store.sessions).toHaveLength(1);
      expect(mockDB.store.sessions[0].status).toBe('active');
      expect(mockDB.store.sessions[0].checkpoints).toBe(0);
    });

    it('returns error when no database', async () => {
      const request = createRequest('POST', { action: 'create' });
      const response = await onRequestPost({
        env: { DB: undefined as never },
        request,
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'No Database' });
    });
  });

  describe('POST /api/scores - checkpoint action', () => {
    it('increments checkpoint count', async () => {
      const gameId = crypto.randomUUID();
      mockDB.store.sessions.push({
        id: gameId,
        created_at: '2026-01-01',
        status: 'active',
        checkpoints: 2,
        score: 0,
      });

      const request = createRequest('POST', { action: 'checkpoint', game_id: gameId });
      const response = await onRequestPost({ env: { DB: mockDB.DB }, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ok: true });
      expect(mockDB.store.sessions[0].checkpoints).toBe(3);
    });

    it('returns 400 when game_id is missing', async () => {
      const request = createRequest('POST', { action: 'checkpoint' });
      const response = await onRequestPost({ env: { DB: mockDB.DB }, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Missing game_id' });
    });
  });

  describe('POST /api/scores - submit action', () => {
    it('submits score and returns leaderboard', async () => {
      const gameId = crypto.randomUUID();
      mockDB.store.sessions.push({
        id: gameId,
        created_at: '2026-01-01',
        status: 'active',
        checkpoints: 3,
        score: 0,
      });

      const request = createRequest('POST', {
        action: 'submit',
        game_id: gameId,
        name: 'ACE',
        score: 1500,
      });
      const response = await onRequestPost({ env: { DB: mockDB.DB }, request });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([{ name: 'ACE', score: 1500 }]);
      expect(mockDB.store.sessions[0].status).toBe('submitted');
      expect(mockDB.store.sessions[0].score).toBe(1500);
      expect(mockDB.store.scores).toHaveLength(1);
      expect(mockDB.store.scores[0].name).toBe('ACE');
      expect(mockDB.store.scores[0].score).toBe(1500);
    });

    it('caps score to server-computed max', async () => {
      const gameId = crypto.randomUUID();
      mockDB.store.sessions.push({
        id: gameId,
        created_at: '2026-01-01',
        status: 'active',
        checkpoints: 2,
        score: 0,
      });

      const request = createRequest('POST', {
        action: 'submit',
        game_id: gameId,
        name: 'ACE',
        score: 5000,
      });
      const response = await onRequestPost({ env: { DB: mockDB.DB }, request });

      expect(response.status).toBe(200);
      expect(mockDB.store.sessions[0].score).toBe(1500);
      expect(mockDB.store.scores[0].score).toBe(1500);
    });

    it('returns 400 when required fields are missing', async () => {
      const request = createRequest('POST', {
        action: 'submit',
        game_id: 'some-id',
      });
      const response = await onRequestPost({ env: { DB: mockDB.DB }, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Missing required fields' });
    });

    it('returns 400 for invalid game session', async () => {
      const request = createRequest('POST', {
        action: 'submit',
        game_id: 'nonexistent',
        name: 'ACE',
        score: 1000,
      });
      const response = await onRequestPost({ env: { DB: mockDB.DB }, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid game session' });
    });

    it('returns 400 for already submitted session', async () => {
      const gameId = crypto.randomUUID();
      mockDB.store.sessions.push({
        id: gameId,
        created_at: '2026-01-01',
        status: 'submitted',
        checkpoints: 1,
        score: 500,
      });

      const request = createRequest('POST', {
        action: 'submit',
        game_id: gameId,
        name: 'ACE',
        score: 1000,
      });
      const response = await onRequestPost({ env: { DB: mockDB.DB }, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Session already used' });
    });
  });

  describe('POST /api/scores - unknown action', () => {
    it('returns 400 for unknown action', async () => {
      const request = createRequest('POST', { action: 'unknown' });
      const response = await onRequestPost({ env: { DB: mockDB.DB }, request });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Unknown action' });
    });
  });

  describe('full game lifecycle', () => {
    it('creates session, records checkpoints, submits, and returns leaderboard', async () => {
      const createReq = createRequest('POST', { action: 'create' });
      const createResponse = await onRequestPost({ env: { DB: mockDB.DB }, request: createReq });
      const { game_id } = await createResponse.json();

      await onRequestPost({
        env: { DB: mockDB.DB },
        request: createRequest('POST', { action: 'checkpoint', game_id }),
      });
      await onRequestPost({
        env: { DB: mockDB.DB },
        request: createRequest('POST', { action: 'checkpoint', game_id }),
      });

      const submitRequest = createRequest('POST', {
        action: 'submit',
        game_id,
        name: 'PLAYER1',
        score: 2500,
      });
      const submitResponse = await onRequestPost({
        env: { DB: mockDB.DB },
        request: submitRequest,
      });
      const leaderboard = await submitResponse.json();

      expect(submitResponse.status).toBe(200);
      expect(leaderboard).toEqual([{ name: 'PLAYER1', score: 1500 }]);
      expect(mockDB.store.sessions[0].status).toBe('submitted');
      expect(mockDB.store.sessions[0].checkpoints).toBe(2);
    });
  });
});
