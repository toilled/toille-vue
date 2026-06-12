import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import Activity from "../Activity.vue";
import flushPromises from "flush-promises";

const mockActivity = {
  activity: "Learn a new programming language",
  type: "education",
};

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    json: () => Promise.resolve(mockActivity),
  } as Response);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Activity.vue", () => {
  it("fetches and displays an activity on mount", async () => {
    const wrapper = mount(Activity);
    expect(wrapper.text()).toContain("activity.loading");
    await flushPromises();
    expect(wrapper.text()).toContain(mockActivity.activity);
    expect(wrapper.text()).toContain("activity.title");
  });

  it("fetches a new activity when clicked", async () => {
    const wrapper = mount(Activity);
    await flushPromises();
    const newMockActivity = {
      activity: "Go for a walk",
      type: "recreational",
    };
    vi.mocked(globalThis.fetch).mockResolvedValue({
      json: () => Promise.resolve(newMockActivity),
    } as Response);
    await wrapper.trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain(newMockActivity.activity);
    expect(wrapper.text()).toContain("activity.title");
  });

  it("shows a loading state while fetching", async () => {
    const wrapper = mount(Activity);
    expect(wrapper.text()).toContain("activity.loading");
    await flushPromises();
    expect(wrapper.text()).not.toContain("activity.loading");
  });

  it("hides the hint after the first click", async () => {
    const wrapper = mount(Activity);
    await flushPromises();
    expect(wrapper.text()).toContain("activity.clickToUpdate");
    await wrapper.trigger("click");
    await flushPromises();
    expect(wrapper.text()).not.toContain("activity.clickToUpdate");
  });

  it("handles fetch errors gracefully", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error("API is down"));
    const wrapper = mount(Activity);
    await flushPromises();
    expect(wrapper.text()).toContain("activity.loading");
    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error("API is down"));
    consoleErrorSpy.mockRestore();
  });
});
