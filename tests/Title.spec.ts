import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Title from "../components/Title.vue";

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
    await wrapper.find("h2.title.question").trigger("mousedown");
    expect(wrapper.emitted("joke")).toBeTruthy();
  });
});
