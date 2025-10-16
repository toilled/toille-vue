import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import Activity from "../Activity.vue";
import flushPromises from "flush-promises";

const mockActivity = {
  activity: "Learn a new programming language",
  type: "education",
};

beforeEach(() => {
  vi.spyOn(global, "fetch").mockResolvedValue({
    json: () => Promise.resolve(mockActivity),
  } as Response);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Activity.vue", () => {
  it("fetches and displays an activity on mount", async () => {
    const wrapper = mount(Activity);
    expect(wrapper.text()).toContain("Loading from The Bored API.");
    await flushPromises();
    expect(wrapper.text()).toContain(mockActivity.activity);
    expect(wrapper.text()).toContain(`Try this ${mockActivity.type} activity`);
  });

  it("fetches a new activity when clicked", async () => {
    const wrapper = mount(Activity);
    await flushPromises();
    const newMockActivity = {
      activity: "Go for a walk",
      type: "recreational",
    };
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve(newMockActivity),
    } as Response);
    await wrapper.trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain(newMockActivity.activity);
    expect(wrapper.text()).toContain(`Try this ${newMockActivity.type} activity`);
  });

  it("shows a loading state while fetching", async () => {
    const wrapper = mount(Activity);
    expect(wrapper.text()).toContain("Loading from The Bored API.");
    await flushPromises();
    expect(wrapper.text()).not.toContain("Loading from The Bored API.");
  });

  it("hides the hint after the first click", async () => {
    const wrapper = mount(Activity);
    await flushPromises();
    expect(wrapper.text()).toContain("Click to update");
    await wrapper.trigger("click");
    await flushPromises();
    expect(wrapper.text()).not.toContain("Click to update");
  });

  it("handles fetch errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    global.fetch.mockRejectedValue(new Error("API is down"));
    const wrapper = mount(Activity);
    await flushPromises();
    expect(wrapper.text()).toContain("Loading from The Bored API.");
    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error("API is down"));
    consoleErrorSpy.mockRestore();
  });
});