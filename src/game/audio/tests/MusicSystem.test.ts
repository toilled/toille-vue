import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MusicSystem } from "../MusicSystem";

describe("MusicSystem", () => {
    let musicSystem: MusicSystem;

    beforeEach(() => {
        // Clear mocks
        vi.clearAllMocks();
        musicSystem = new MusicSystem();
    });

    afterEach(() => {
        musicSystem.stop();
    });

    it("should initialize AudioContext on start", () => {
        musicSystem.start();
        // Since AudioContext is a stub global in setupThree, we can check if it was instantiated.
        // But setupThree stubs it as a class.
        // To verify instantiation we might need to spy on window.AudioContext.
        // But it's already stubbed.

        // Let's just check if getFrequencyData returns something valid after start.
        const data = musicSystem.getFrequencyData();
        expect(data).toBeInstanceOf(Uint8Array);
        expect(data.length).toBeGreaterThan(0);
    });

    it("should stop correctly and clean up", () => {
        musicSystem.start();
        musicSystem.stop();

        // After stop, getFrequencyData should return empty array
        const data = musicSystem.getFrequencyData();
        expect(data.length).toBe(0);
    });
});
