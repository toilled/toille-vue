import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Title from "../Title.vue";
import { vi, beforeEach, afterEach } from "vitest";

describe("Title.vue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it("renders the title and subtitle", async () => {
    const wrapper = mount(Title, {
      props: {
        title: "Test Title",
        subtitle: "Test Subtitle",
        activity: false,
        joke: false,
      },
    });

    // Simulate manim finishing
    vi.advanceTimersByTime(4500);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Test Title");
    expect(wrapper.text()).toContain("Test Subtitle");
  });

  it('emits an "activity" event on title mousedown', async () => {
    const wrapper = mount(Title, {
      props: {
        title: "Test Title",
        subtitle: "Test Subtitle",
        activity: false,
        joke: false,
      },
    });

    // Simulate manim finishing
    vi.advanceTimersByTime(4500);
    await wrapper.vm.$nextTick();

    await wrapper.find(".title.question").trigger("mousedown");
    expect(wrapper.emitted("activity")).toBeTruthy();
  });

  it('emits a "joke" event on subtitle mousedown', async () => {
    const wrapper = mount(Title, {
        props: {
            title: "Test Title",
            subtitle: "Test Subtitle",
            activity: false,
            joke: false,
        },
    });

    // Simulate manim finishing
    vi.advanceTimersByTime(4500);
    await wrapper.vm.$nextTick();

    await wrapper.find("h2.title.question").trigger("mousedown");
    expect(wrapper.emitted("joke")).toBeTruthy();
  });
});
