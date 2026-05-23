import { describe, it, expect } from "vitest";
import * as constants from "../constants/CyberpunkCity";

describe("CyberpunkCity constants", () => {
  it("exports numerical constants", () => {
    expect(constants.LEADERBOARD_CANVAS_SIZE).toBe(1024);
    expect(constants.MOBILE_BREAKPOINT).toBe(768);
    expect(constants.SPARK_COUNT).toBe(2000);
    expect(constants.SPARK_BURST_SIZE).toBe(30);
    expect(constants.CAR_COUNT).toBe(150);
    expect(constants.CAMERA_FOV).toBe(60);
    expect(constants.CAMERA_FAR).toBe(3000);
    expect(constants.CAMERA_NEAR).toBe(1);
    expect(constants.ORBIT_SPEED).toBe(0.1);
    expect(constants.INTRO_DURATION_MS).toBe(4000);
    expect(constants.CHECKPOINT_RADIUS).toBe(25);
    expect(constants.CHECKPOINT_HEIGHT).toBe(1000);
  });

  it("exports fallback/threshold constants", () => {
    expect(constants.FALLBACK_FPS_THRESHOLD).toBe(25);
    expect(constants.FALLBACK_FPS_CONSECUTIVE_CHECKS).toBe(3);
    expect(constants.FALLBACK_CHECK_INTERVAL_MS).toBe(1000);
    expect(constants.FALLBACK_MONITOR_DELAY_MS).toBe(5000);
  });
});
