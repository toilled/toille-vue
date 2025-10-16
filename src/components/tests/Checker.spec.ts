import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Checker from "../Checker.vue";

describe("Checker.vue", () => {
  vi.useFakeTimers();

  it("renders correctly", () => {
    const wrapper = mount(Checker);
    expect(wrapper.text()).toContain("Alcohol Checker");
  });

  it("initializes count to 0", () => {
    const wrapper = mount(Checker);
    expect(wrapper.vm.count).toBe(0);
  });

  it("increments count when add is clicked", async () => {
    const wrapper = mount(Checker);
    const addButton = wrapper.findAll('button').find(button => button.text() === 'Add');
    await addButton.trigger("click");
    expect(wrapper.vm.count).toBe(1);
  });

  it("decrements count when subtract is clicked", async () => {
    const wrapper = mount(Checker);
    const addButton = wrapper.findAll('button').find(button => button.text() === 'Add');
    const subtractButton = wrapper.findAll('button').find(button => button.text() === 'Subtract');
    await addButton.trigger("click");
    await addButton.trigger("click");
    await subtractButton.trigger("click");
    expect(wrapper.vm.count).toBe(1);
  });

  it("does not decrement count below 0", async () => {
    const wrapper = mount(Checker);
    const subtractButton = wrapper.findAll('button').find(button => button.text() === 'Subtract');
    await subtractButton.trigger("click");
    expect(wrapper.vm.count).toBe(0);
  });

  it("updates times correctly when count changes", async () => {
    const date = new Date(2000, 1, 1, 13);
    vi.setSystemTime(date);
    const wrapper = mount(Checker);

    const options = {
      hour: "2-digit",
      minute: "2-digit",
    } as const;

    // Initial state
    expect(wrapper.vm.limitTime).toBe(new Date().toLocaleTimeString([], options));
    expect(wrapper.vm.soberTime).toBe(new Date().toLocaleTimeString([], options));

    // Add one unit
    const addButton = wrapper.findAll('button').find(button => button.text() === 'Add');
    await addButton.trigger("click");
    const currentTime = new Date().getTime();
    expect(wrapper.vm.limitTime).toBe(new Date(currentTime + 60 * 60 * 1000).toLocaleTimeString([], options));
    expect(wrapper.vm.soberTime).toBe(new Date(currentTime + 2 * 60 * 60 * 1000).toLocaleTimeString([], options));

    vi.useRealTimers();
  });
});