import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import { cityBackground } from "../CityBackgroundManager";

describe("CityBackgroundManager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts enabled by default", () => {
    expect(cityBackground.isEnabled.value).toBe(true);
  });

  it("toggle changes enabled state", () => {
    cityBackground.toggle();
    expect(cityBackground.isEnabled.value).toBe(false);
    cityBackground.toggle();
    expect(cityBackground.isEnabled.value).toBe(true);
  });

  it("persists state to localStorage", async () => {
    cityBackground.toggle();
    await nextTick();
    expect(localStorage.getItem("city-background-enabled")).toBe("false");
    cityBackground.toggle();
    await nextTick();
    expect(localStorage.getItem("city-background-enabled")).toBe("true");
  });
});
