import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import GameUI from "../GameUI.vue";
import { ScoreService } from "../../utils/ScoreService";

// Mock ScoreService
vi.mock("../../utils/ScoreService", () => ({
    ScoreService: {
        getTopScores: vi.fn(),
        submitScore: vi.fn(),
    },
}));

describe("GameUI.vue Leaderboard Modal", () => {
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
        leaderboard: [
            { name: "P1", score: 100 },
            { name: "P2", score: 50 }
        ],
        showLeaderboard: false
    };

    it("shows leaderboard modal when showLeaderboard is true", async () => {
        wrapper = mount(GameUI, {
            props: { ...defaultProps, showLeaderboard: true }
        });
        expect(wrapper.find("#leaderboard-modal").exists()).toBe(true);
        expect(wrapper.text()).toContain("LEADERBOARD");
        expect(wrapper.text()).toContain("P1");
        expect(wrapper.text()).toContain("100");
    });

    it("hides leaderboard modal when showLeaderboard is false", async () => {
        wrapper = mount(GameUI, {
            props: { ...defaultProps, showLeaderboard: false }
        });
        expect(wrapper.find("#leaderboard-modal").exists()).toBe(false);
    });

    it("emits close-leaderboard when close button is clicked", async () => {
        wrapper = mount(GameUI, {
            props: { ...defaultProps, showLeaderboard: true }
        });

        await wrapper.find(".close-btn").trigger("click");
        expect(wrapper.emitted("close-leaderboard")).toBeTruthy();
    });
});
