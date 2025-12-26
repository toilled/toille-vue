export interface ScoreEntry {
    name: string;
    score: number;
}

const LOCAL_KEY = 'cyberpunk_city_scores';

export const ScoreService = {
    async getTopScores(): Promise<ScoreEntry[]> {
        try {
            const res = await fetch('/api/scores');
            // If we get an HTML response (likely SPA fallback for 404), treat as error
            const contentType = res.headers.get("content-type");
            if (res.ok && contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (Array.isArray(data)) return data;
            }
        } catch (e) {
            console.warn("API unavailable, using local storage:", e);
        }
        return getLocalScores();
    },

    async submitScore(name: string, score: number): Promise<ScoreEntry[]> {
        try {
            const res = await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score })
            });
            const contentType = res.headers.get("content-type");
            if (res.ok && contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (Array.isArray(data)) return data;
            }
        } catch (e) {
            console.warn("API unavailable, using local storage:", e);
        }

        saveLocalScore(name, score);
        return getLocalScores();
    }
};

function getLocalScores(): ScoreEntry[] {
    try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (!raw) return [];
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data.sort((a: any, b: any) => b.score - a.score).slice(0, 5);
        return [];
    } catch {
        return [];
    }
}

function saveLocalScore(name: string, score: number) {
    const scores = getLocalScores();
    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score);
    // Keep top 5
    const top5 = scores.slice(0, 5);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(top5));
}
