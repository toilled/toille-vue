import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import PageContent from "../PageContent.vue";
import Paragraph from "../Paragraph.vue";
import pages from "../../configs/pages.json";
import flushPromises from "flush-promises";

describe("PageContent.vue", () => {
  it("renders the content of the first page by default", async () => {
    const wrapper = mount(PageContent, {
      props: {
        name: "home"
      }
    });
    await flushPromises();
    expect(wrapper.text()).toContain(pages[0].title);
    expect(wrapper.findAllComponents(Paragraph).length).toBe(
      pages[0].body.length
    );
  });

  it("renders the content of a specific page", async () => {
    const pageName = pages[1].link.slice(1);
    const wrapper = mount(PageContent, {
      props: {
        name: pageName
      }
    });
    await flushPromises();
    expect(wrapper.text()).toContain(pages[1].title);
    expect(wrapper.findAllComponents(Paragraph).length).toBe(
      pages[1].body.length
    );
  });

  it("renders a 404 message for a non-existent page", async () => {
    const pageName = "non-existent-page";
    const wrapper = mount(PageContent, {
      props: {
        name: pageName
      }
    });
    await flushPromises();
    expect(wrapper.text()).toContain("404 - Page not found");
    expect(wrapper.text()).toContain(
      `The page ${pageName} does not exist!`
    );
  });

  it("shows a hint on title mousedown", async () => {
    vi.useFakeTimers();
    const wrapper = mount(PageContent, {
       props: { name: "home" }
    });
    await flushPromises();
    const title = wrapper.find(".title");
    await title.trigger("mousedown");
    expect(wrapper.text()).toContain("Nothing here");
    vi.runAllTimers();
    await flushPromises();
    expect(wrapper.text()).not.toContain("Nothing here");
    vi.useRealTimers();
  });

});