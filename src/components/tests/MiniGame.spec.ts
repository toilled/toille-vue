import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MiniGame from "../MiniGame.vue";

describe("MiniGame.vue", () => {
  it("renders the initial score", () => {
    const wrapper = mount(MiniGame);
    expect(wrapper.text()).toContain("Score: 0");
  });

  it("increments the score when the button is clicked", async () => {
    const wrapper = mount(MiniGame);
    const button = wrapper.find("button");
    await button.trigger("click");
    expect(wrapper.text()).toContain("Score: 1");
    await button.trigger("click");
    expect(wrapper.text()).toContain("Score: 2");
  });

  it("moves the button when it is clicked", async () => {
    const wrapper = mount(MiniGame);
    const button = wrapper.find("button");
    const initialStyle = { ...wrapper.vm.buttonStyle };
    await button.trigger("click");
    const newStyle = wrapper.vm.buttonStyle;
    expect(newStyle.left).not.toBe(initialStyle.left);
    expect(newStyle.top).not.toBe(initialStyle.top);
  });
});