import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import GameOverModal from "../GameOverModal.vue";

const mockGetTopScores = vi.fn();
const mockSubmitScore = vi.fn();
vi.mock("../../utils/ScoreService", () => ({
  ScoreService: {
    getTopScores: (...args: unknown[]) => mockGetTopScores(...args),
    submitScore: (...args: unknown[]) => mockSubmitScore(...args),
  },
}));

describe("GameOverModal.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTopScores.mockResolvedValue([
      { name: "ACE", score: 1000 },
      { name: "BEST", score: 500 },
    ]);
    mockSubmitScore.mockResolvedValue([
      { name: "PLAYER", score: 1500 },
      { name: "ACE", score: 1000 },
    ]);
  });

  it("does not render when isGameOver is false", () => {
    const wrapper = mount(GameOverModal, {
      props: { isGameOver: false, drivingScore: 0, isDrivingMode: false, leaderboard: [] },
    });
    expect(wrapper.find("#game-over").exists()).toBe(false);
  });

  it("renders game over screen when isGameOver is true", () => {
    const wrapper = mount(GameOverModal, {
      props: { isGameOver: true, drivingScore: 500, isDrivingMode: true, leaderboard: [] },
    });
    expect(wrapper.find("#game-over").exists()).toBe(true);
    expect(wrapper.text()).toContain("GAME OVER");
    expect(wrapper.text()).toContain("SCORE: 500");
  });

  it("shows leaderboard entries", () => {
    const leaderboard = [
      { name: "ACE", score: 1000 },
      { name: "BEST", score: 500 },
    ];
    const wrapper = mount(GameOverModal, {
      props: { isGameOver: true, drivingScore: 500, isDrivingMode: true, leaderboard },
    });
    expect(wrapper.text()).toContain("ACE");
    expect(wrapper.text()).toContain("1000");
    expect(wrapper.text()).toContain("BEST");
    expect(wrapper.text()).toContain("500");
  });

  it("allows score submission", async () => {
    const wrapper = mount(GameOverModal, {
      props: { isGameOver: true, drivingScore: 1500, isDrivingMode: true, leaderboard: [] },
    });
    await wrapper.find(".name-input").setValue("PLAYER");
    await wrapper.find(".submit-btn").trigger("click");
    await flushPromises();
    expect(mockSubmitScore).toHaveBeenCalledWith("PLAYER", 1500, null);
  });

  it("emits update-leaderboard on mount when game is over", async () => {
    const wrapper = mount(GameOverModal, {
      props: { isGameOver: true, drivingScore: 500, isDrivingMode: true, leaderboard: [] },
    });
    await flushPromises();
    expect(mockGetTopScores).toHaveBeenCalled();
    expect(wrapper.emitted("update-leaderboard")).toBeTruthy();
  });
});
