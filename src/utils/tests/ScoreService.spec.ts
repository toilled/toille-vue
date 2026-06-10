import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ScoreService } from "../ScoreService";

describe("ScoreService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("getTopScores falls back to local storage when API fails", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error("Network error"));

    const scores = await ScoreService.getTopScores();
    expect(scores).toEqual([]);
  });

  it("getTopScores returns API data when available", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: vi.fn(() => "application/json") },
      json: () => Promise.resolve([{ name: "ACE", score: 1000 }]),
    } as never);

    const scores = await ScoreService.getTopScores();
    expect(scores).toEqual([{ name: "ACE", score: 1000 }]);
  });

  it("submitScore sends to API and falls back to local", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error("Network error"));

    const scores = await ScoreService.submitScore("TEST", 500);
    expect(scores.length).toBe(1);
    expect(scores[0].name).toBe("TEST");
    expect(scores[0].score).toBe(500);
  });

  it("submitScore sanitizes long names", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error("Network error"));

    const scores = await ScoreService.submitScore("VERYLONGNAMEHERE", 100);
    expect(scores[0].name.length).toBeLessThanOrEqual(20);
  });

  it("submitScore validates and clamps scores", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error("Network error"));

    const scores = await ScoreService.submitScore("TEST", -100);
    expect(scores[0].score).toBe(0);

    const scores2 = await ScoreService.submitScore("TEST", Infinity);
    expect(scores2[0].score).toBe(0);
  });

  it("submitScore returns empty when name is empty", async () => {
    const scores = await ScoreService.submitScore("", 500);
    expect(scores).toEqual([]);
  });

  it("getTopScores returns local scores sorted descending", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error("Network error"));

    await ScoreService.submitScore("PLAYER1", 300);
    await ScoreService.submitScore("PLAYER2", 500);
    const scores = await ScoreService.getTopScores();
    expect(scores[0].score).toBe(500);
    expect(scores[1].score).toBe(300);
  });

  it("limits local scores to top 5", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error("Network error"));

    for (let i = 0; i < 10; i++) {
      await ScoreService.submitScore(`P${i}`, i * 100);
    }
    const scores = await ScoreService.getTopScores();
    expect(scores.length).toBeLessThanOrEqual(5);
  });

  it("createSession returns game_id on success", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: vi.fn(() => "application/json") },
      json: () => Promise.resolve({ game_id: "abc-123" }),
    } as never);

    const gameId = await ScoreService.createSession();
    expect(gameId).toBe("abc-123");
    expect(mockFetch).toHaveBeenCalledWith("/api/scores", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ action: "create" }),
    }));
  });

  it("createSession returns null on failure", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error("Network error"));

    const gameId = await ScoreService.createSession();
    expect(gameId).toBeNull();
  });

  it("recordCheckpoint sends checkpoint event", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({ ok: true } as never);

    await ScoreService.recordCheckpoint("abc-123");
    expect(mockFetch).toHaveBeenCalledWith("/api/scores", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ action: "checkpoint", game_id: "abc-123" }),
    }));
  });

  it("recordCheckpoint does not throw on failure", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error("Network error"));

    await expect(ScoreService.recordCheckpoint("abc-123")).resolves.toBeUndefined();
  });

  it("submitScore with gameId sends session-based submission", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: vi.fn(() => "application/json") },
      json: () => Promise.resolve([{ name: "ACE", score: 1000 }]),
    } as never);

    const scores = await ScoreService.submitScore("ACE", 1000, "session-1");
    expect(scores).toEqual([{ name: "ACE", score: 1000 }]);
    expect(mockFetch).toHaveBeenCalledWith("/api/scores", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ action: "submit", game_id: "session-1", name: "ACE", score: 1000 }),
    }));
  });

  it("submitScore with gameId falls back to local on failure", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValue(new Error("Network error"));

    const scores = await ScoreService.submitScore("ACE", 1000, "session-1");
    expect(scores.length).toBe(1);
    expect(scores[0].score).toBe(1000);
  });
});
