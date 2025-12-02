import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Paragraph from "../Paragraph.vue";

describe("Paragraph.vue", () => {
  it("renders the paragraph content", () => {
    const wrapper = mount(Paragraph, {
      props: {
        paragraph: "This is a test paragraph.",
        last: false,
      },
    });
    expect(wrapper.text()).toContain("This is a test paragraph.");
  });

  it('applies the "mb-0" class when `last` is true', () => {
    const wrapper = mount(Paragraph, {
      props: {
        paragraph: "This is the last paragraph.",
        last: true,
      },
    });
    // In Vuetify migration, I used p class="mb-0" etc directly on the p tag.
    // Wrapper is the root element (p).
    expect(wrapper.classes()).toContain("mb-0");
  });

  it('does not apply the "mb-0" class when `last` is false', () => {
    const wrapper = mount(Paragraph, {
      props: {
        paragraph: "This is not the last paragraph.",
        last: false,
      },
    });
    expect(wrapper.classes()).not.toContain("mb-0");
    expect(wrapper.classes()).toContain("mb-4");
  });

  it("renders HTML content correctly", () => {
    const wrapper = mount(Paragraph, {
      props: {
        paragraph: "<strong>Bold text</strong>",
        last: false,
      },
    });
    expect(wrapper.find("strong").exists()).toBe(true);
    expect(wrapper.text()).toContain("Bold text");
  });
});
