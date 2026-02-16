import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import GameUI from "../GameUI.svelte";
import { ScoreService } from "../../utils/ScoreService";

// Mock ScoreService
vi.mock("../../utils/ScoreService", () => ({
    ScoreService: {
        getTopScores: vi.fn(),
        submitScore: vi.fn(),
    },
}));

describe("GameUI.svelte", () => {
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
        showLeaderboard: false
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (ScoreService.getTopScores as any).mockResolvedValue([
            { name: "ACE", score: 1000 },
        ]);
        (ScoreService.submitScore as any).mockResolvedValue([
            { name: "TEST", score: 1500 },
            { name: "ACE", score: 1000 },
        ]);
    });

    it("does not show return button initially", () => {
        const { queryByText } = render(GameUI, { props: defaultProps });
        expect(queryByText("RETURN")).toBeFalsy();
    });

    it("shows return button when isGameMode is true", async () => {
        const { getByText } = render(GameUI, { props: { ...defaultProps, isGameMode: true } });
        expect(getByText("RETURN")).toBeTruthy();
    });

    it("emits exit-game-mode when return button is clicked", async () => {
        const mockHandler = vi.fn();
        const { getByText } = render(GameUI, {
            props: {
                ...defaultProps,
                isGameMode: true,
                'on:exit-game-mode': mockHandler
            }
        });
        const button = getByText("RETURN");
        await fireEvent.click(button);
        expect(mockHandler).toHaveBeenCalled();
    });

    it("shows game over screen when isGameOver and isDrivingMode are true", async () => {
        const { getByText } = render(GameUI, { props: { ...defaultProps, isGameOver: true, isDrivingMode: true } });
        expect(getByText("GAME OVER")).toBeTruthy();
    });

    it("submits score correctly", async () => {
        const mockHandler = vi.fn();
        const { container } = render(GameUI, {
            props: {
                ...defaultProps,
                isGameOver: true,
                isDrivingMode: true,
                drivingScore: 1234,
                'on:update-leaderboard': mockHandler
            }
        });

        const input = container.querySelector("input.name-input");
        const button = container.querySelector("button.submit-btn");
        expect(input).toBeTruthy();
        expect(button).toBeTruthy();

        await fireEvent.input(input!, { target: { value: "hero" } });
        await fireEvent.click(button!);

        expect(ScoreService.submitScore).toHaveBeenCalledWith("HERO", 1234);
        await new Promise(r => setTimeout(r, 0));
        expect(mockHandler).toHaveBeenCalled();
    });

    it("shows mobile controls when isMobile and isExplorationMode", async () => {
        const { container } = render(GameUI, { props: { ...defaultProps, isMobile: true, isExplorationMode: true } });
        expect(container.querySelector("#exploration-controls")).toBeTruthy();
    });
});
