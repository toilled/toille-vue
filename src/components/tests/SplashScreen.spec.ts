import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SplashScreen from "../SplashScreen.vue";

describe("SplashScreen.vue", () => {
  it("renders INITIALIZING text", () => {
    const wrapper = mount(SplashScreen);
    expect(wrapper.text()).toContain("INITIALIZING");
  });

  it("has glitch effect class", () => {
    const wrapper = mount(SplashScreen);
    expect(wrapper.find(".glitch").exists()).toBe(true);
    expect(wrapper.find(".glitch").attributes("data-text")).toBe("INITIALIZING...");
  });
});
