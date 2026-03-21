import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import NoughtsAndCrosses from "../NoughtsAndCrosses.vue";

describe("NoughtsAndCrosses.vue", () => {
  it("renders the game board", () => {
    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.find(".board").exists()).toBe(true);
    expect(wrapper.findAll(".cell")).toHaveLength(9);
  });

  it("renders the title", () => {
    const wrapper = mount(NoughtsAndCrosses);
    expect(wrapper.text()).toContain("Noughts and Crosses");
  });

  it("displays empty cells initially", () => {
    const wrapper = mount(NoughtsAndCrosses);
    const cells = wrapper.findAll(".cell");
    cells.forEach((cell) => {
      expect(cell.text()).toBe("");
    });
  });
});
