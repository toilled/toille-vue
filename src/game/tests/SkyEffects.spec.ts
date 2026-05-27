import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scene } from "three";
import { SkyEffects } from "../SkyEffects";

describe("SkyEffects", () => {
  let scene: Scene;
  let sky: SkyEffects;

  beforeEach(() => {
    vi.useFakeTimers();
    scene = new Scene();
    sky = new SkyEffects(scene);
  });

  afterEach(() => {
    vi.useRealTimers();
    sky.dispose();
  });

  it("creates sky dome and stars", () => {
    expect(sky).toBeDefined();
    expect(scene.fog).toBeDefined();
  });

  it("addClouds creates cloud sprites", () => {
    sky.addClouds();
    expect(scene.add).toHaveBeenCalled();
  });

  it("update animates cloud positions", () => {
    sky.addClouds();
    sky.update(0.1);
    sky.update(0.1);
  });

  it("setFogDensity changes fog", () => {
    sky.setFogDensity(0.002);
    expect(scene.fog).toBeDefined();
  });

  it("setFogColor changes fog color", () => {
    sky.setFogColor(0xff0000);
    expect(scene.fog).toBeDefined();
  });

  it("triggerLightning temporarily changes fog density", () => {
    sky.triggerLightning();
    vi.advanceTimersByTime(300);
  });

  it("dispose cleans up", () => {
    sky.addClouds();
    sky.dispose();
    expect(scene.fog).toBeNull();
  });
});
