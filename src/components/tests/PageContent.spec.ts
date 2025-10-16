import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PageContent from "../PageContent.vue";
import Paragraph from "../Paragraph.vue";
import { createRouter, createMemoryHistory } from "vue-router";
import pages from "../../configs/pages.json";
import flushPromises from "flush-promises";
import Animation from "../Animation.vue";

const createTestRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/:name", component: PageContent, name: "page" },
      { path: "/", component: PageContent, name: "home" },
      { path: "/:pathMatch(.*)*", name: "not-found", component: PageContent },
    ],
  });
};

describe("PageContent.vue", () => {
  it("renders the content of the first page by default", async () => {
    const router = createTestRouter("/");
    router.push("/");
    await router.isReady();
    const wrapper = mount(PageContent, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain(pages[0].title);
    expect(wrapper.findAllComponents(Paragraph).length).toBe(
      pages[0].body.length
    );
  });

  it("renders the content of a specific page", async () => {
    const pageName = pages[1].link.slice(1);
    const router = createTestRouter(`/${pageName}`);
    router.push({ name: "page", params: { name: pageName } });
    await router.isReady();
    const wrapper = mount(PageContent, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain(pages[1].title);
    expect(wrapper.findAllComponents(Paragraph).length).toBe(
      pages[1].body.length
    );
  });

  it("renders a 404 message for a non-existent page", async () => {
    const pageName = "non-existent-page";
    const router = createTestRouter(`/${pageName}`);
    router.push({ name: "page", params: { name: pageName } });
    await router.isReady();
    const wrapper = mount(PageContent, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain("404 - Page not found");
    expect(wrapper.text()).toContain(
      `The page ${pageName} does not exist!`
    );
  });

  it("renders a 404 message for a catch-all route", async () => {
    const router = createTestRouter("/some/random/path");
    router.push("/some/random/path");
    await router.isReady();
    const wrapper = mount(PageContent, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain("404 - Page not found");
  });

  it("toggles the animation on title mousedown", async () => {
    const router = createTestRouter();
    router.push("/");
    await router.isReady();
    const wrapper = mount(PageContent, {
      global: {
        plugins: [router],
        stubs: {
          Animation: true,
        },
      },
    });
    await flushPromises();
    const title = wrapper.find(".title");
    await title.trigger("mousedown");
    await flushPromises();
    expect(wrapper.findComponent(Animation).exists()).toBe(true);
    await title.trigger("mousedown");
    await flushPromises();
    expect(wrapper.findComponent(Animation).exists()).toBe(false);
  });

  it("updates the document title", async () => {
    const pageName = pages[1].link.slice(1);
    const router = createTestRouter(`/${pageName}`);
    router.push({ name: "page", params: { name: pageName } });
    await router.isReady();
    mount(PageContent, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();
    expect(document.title).toBe(`Elliot > ${pages[1].title}`);
  });
});