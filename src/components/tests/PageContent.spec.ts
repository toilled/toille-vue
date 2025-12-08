import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import PageContent from "../PageContent.vue";
import Paragraph from "../Paragraph.vue";
import { createRouter, createWebHistory } from "vue-router";
import pages from "../../configs/pages.json";
import flushPromises from "flush-promises";

const createTestRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/:name", component: PageContent, name: "page" },
      { path: "/", component: PageContent, name: "home" },
      { path: "/:pathMatch(.*)*", name: "not-found", component: PageContent },
    ],
  });
};

describe("PageContent.vue", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the content of the first page by default", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => pages[0],
    });

    const router = createTestRouter();
    router.push("/");
    await router.isReady();
    const wrapper = mount(PageContent, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();
    expect(global.fetch).toHaveBeenCalledWith("/api/page");
    expect(wrapper.text()).toContain(pages[0].title);
    expect(wrapper.findAllComponents(Paragraph).length).toBe(
      pages[0].body.length
    );
  });

  it("renders the content of a specific page", async () => {
    const pageName = pages[1].link.slice(1);
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => pages[1],
    });

    const router = createTestRouter();
    router.push({ name: "page", params: { name: pageName } });
    await router.isReady();
    const wrapper = mount(PageContent, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();
    expect(global.fetch).toHaveBeenCalledWith(`/api/page?name=${pageName}`);
    expect(wrapper.text()).toContain(pages[1].title);
    expect(wrapper.findAllComponents(Paragraph).length).toBe(
      pages[1].body.length
    );
  });

  it("renders a 404 message for a non-existent page returned by API", async () => {
    const pageName = "non-existent-page";
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => null,
    });

    const router = createTestRouter();
    router.push({ name: "page", params: { name: pageName } });
    await router.isReady();
    const wrapper = mount(PageContent, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();
    expect(global.fetch).toHaveBeenCalledWith(`/api/page?name=${pageName}`);
    expect(wrapper.text()).toContain("404 - Page not found");
    // Updated expectation: the route param is displayed.
    expect(wrapper.text()).toContain(
      `The page ${pageName} does not exist!`
    );
  });

  it("renders a 404 message for a catch-all route without calling API", async () => {
    const router = createTestRouter();
    router.push("/some/random/path");
    await router.isReady();
    const wrapper = mount(PageContent, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();

    // API should NOT be called for catch-all route if implementation avoids it
    expect(global.fetch).not.toHaveBeenCalled();

    expect(wrapper.text()).toContain("404 - Page not found");
  });

  it("shows a hint on title mousedown", async () => {
    vi.useFakeTimers();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => pages[0],
    });

    const router = createTestRouter("/");
    router.push("/");
    await router.isReady();
    const wrapper = mount(PageContent, {
      global: {
        plugins: [router],
      },
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
