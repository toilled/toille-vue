import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Title from "../Title.vue";

describe("Title.vue", () => {
  it("renders the title and subtitle", () => {
    const wrapper = mount(Title, {
      props: {
        title: "Test Title",
        subtitle: "Test Subtitle",
        activity: false,
        joke: false,
      },
    });
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
    // Class changed from .title.question to .text-h4.question
    await wrapper.find("h1").trigger("mousedown");
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
    // Class changed
    await wrapper.find("h2").trigger("mousedown");
    expect(wrapper.emitted("joke")).toBeTruthy();
  });
});
