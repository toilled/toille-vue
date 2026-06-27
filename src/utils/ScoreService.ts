export interface ScoreEntry {
  name: string;
  score: number;
}

const LOCAL_KEY = 'cyberpunk_city_scores';
const MAX_NAME_LENGTH = 20;
const MIN_SCORE = 0;
const MAX_SCORE = Number.MAX_SAFE_INTEGER;
const FETCH_TIMEOUT_MS = 5000;

function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function sanitizeName(name: string): string {
  return name.trim().substring(0, MAX_NAME_LENGTH);
}

function validateScore(score: number): number {
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return MIN_SCORE;
  }
  return Math.max(MIN_SCORE, Math.min(score, MAX_SCORE));
}

async function handleResponse(res: Response): Promise<ScoreEntry[] | null> {
  if (res.ok) {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  }
  return null;
}

export const ScoreService = {
  async getTopScores(): Promise<ScoreEntry[]> {
    try {
      const res = await fetchWithTimeout('/api/scores');
      const data = await handleResponse(res);
      if (data) return data;

      if (!res.ok) {
        console.warn(
          'Leaderboard API returned error, falling back to local storage.',
          res.status,
          res.statusText
        );
      }
    } catch (e) {
      console.warn('API unavailable, using local storage:', e);
    }
    return getLocalScores();
  },

  async createSession(): Promise<string | null> {
    try {
      const res = await fetchWithTimeout('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.game_id as string;
      }
    } catch (e) {
      console.warn('Failed to create game session:', e);
    }
    return null;
  },

  async recordCheckpoint(gameId: string): Promise<void> {
    try {
      await fetchWithTimeout('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkpoint', game_id: gameId }),
      });
    } catch {
      // Fire-and-forget - failures are non-critical
    }
  },

  async submitScore(name: string, score: number, gameId?: string | null): Promise<ScoreEntry[]> {
    const sanitizedName = sanitizeName(name);
    const validatedScore = validateScore(score);

    if (sanitizedName.length === 0) {
      return getLocalScores();
    }

    if (gameId) {
      try {
        const res = await fetchWithTimeout('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'submit',
            game_id: gameId,
            name: sanitizedName,
            score: validatedScore,
          }),
        });

        const data = await handleResponse(res);
        if (data) return data;

        console.warn('Score submission failed, falling back to local storage.', res.status);
      } catch (e) {
        console.warn('API unavailable, using local storage:', e);
      }

      saveLocalScore(sanitizedName, validatedScore);
      return getLocalScores();
    }

    saveLocalScore(sanitizedName, validatedScore);
    return getLocalScores();
  },
};

function getLocalScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data.sort((a, b) => b.score - a.score).slice(0, 5);
    return [];
  } catch {
    return [];
  }
}

function saveLocalScore(name: string, score: number) {
  const scores = getLocalScores();
  scores.push({ name, score });
  scores.sort((a, b) => b.score - a.score);
  const top5 = scores.slice(0, 5);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(top5));
}
