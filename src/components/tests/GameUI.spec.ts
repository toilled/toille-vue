import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import GameUI from "../GameUI.vue";

const { mockGetTopScores, mockSubmitScore } = vi.hoisted(() => ({
  mockGetTopScores: vi.fn(),
  mockSubmitScore: vi.fn(),
}));

vi.mock("../../utils/ScoreService", () => ({
  ScoreService: {
    getTopScores: mockGetTopScores,
    submitScore: mockSubmitScore,
  },
}));

describe("GameUI.vue", () => {
  let wrapper: ReturnType<typeof mount>;

  const mockControls = {
    left: false,
    right: false,
    forward: false,
    backward: false,
  };

  const mockLookControls = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  const defaultProps = {
    isDrivingMode: false,
    isGameMode: false,
    isExplorationMode: false,
    isFlyingTour: false,
    isCinematicMode: false,
    isGameOver: false,
    isMobile: false,
    drivingScore: 0,
    droneScore: 0,
    timeLeft: 0,
    distToTarget: 0,
    controls: mockControls,
    lookControls: mockLookControls,
    leaderboard: [],
  };

  beforeEach(() => {
    mockGetTopScores.mockResolvedValue([{ name: "ACE", score: 1000 }]);
    mockSubmitScore.mockResolvedValue([
      { name: "TEST", score: 1500 },
      { name: "ACE", score: 1000 },
    ]);

    wrapper = mount(GameUI, {
      props: defaultProps,
    });
  });

  it("does not show return button initially", () => {
    expect(wrapper.find("#return-button").exists()).toBe(false);
  });

  it("shows return button when isGameMode is true", async () => {
    await wrapper.setProps({ isGameMode: true });
    expect(wrapper.find("#return-button").exists()).toBe(true);
  });

  it("emits exit-game-mode when return button is clicked", async () => {
    await wrapper.setProps({ isGameMode: true });
    await wrapper.find("#return-button").trigger("click");
    expect(wrapper.emitted("exit-game-mode")).toBeTruthy();
  });

  it("shows game over screen when isGameOver and isDrivingMode are true", async () => {
    await wrapper.setProps({ isGameOver: true, isDrivingMode: true });
    expect(wrapper.find("#game-over").exists()).toBe(true);
  });

  it("renders score counter when driving", async () => {
    await wrapper.setProps({ isDrivingMode: true, drivingScore: 100 });
    expect(wrapper.find("#score-counter").exists()).toBe(true);
    expect(wrapper.text()).toContain("SCORE: 100");
  });

  it("shows mobile controls when isMobile and isExplorationMode", async () => {
    await wrapper.setProps({ isMobile: true, isExplorationMode: true });
    expect(wrapper.find("#exploration-controls").exists()).toBe(true);
  });
});
