import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../../app.vue"; // Correct case
import { createRouter, createMemoryHistory } from "vue-router";
import flushPromises from "flush-promises";

const createTestRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "Home" } },
      { path: "/:name", component: { template: "Page" } },
      { path: "/:pathMatch(.*)*", component: { template: "NotFound" } },
    ],
  });
};

vi.mock("../../configs/pages.json", () => ({
  default: [
    { name: "Home", link: "/", title: "Home" },
    { name: "About", link: "/about", title: "About Me" },
  ],
}));

vi.mock("../../configs/titles.json", () => ({
  default: {
    title: "Main Title",
    subtitle: "Main Subtitle",
  },
}));

// Nuxt uses useHead, but we are in a unit test environment where it's not auto-imported
vi.stubGlobal('useHead', vi.fn());

describe("App.vue", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it("renders the main components", async () => {
    const router = createTestRouter();
    router.push("/");
    await router.isReady();
    wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          "NuxtPage": true,
          "ClientOnly": { template: "<div><slot /></div>" },
          "CyberpunkCity": true,
          "Transition": false // Stubbing transition can help with async issues, or keep false
        },
      },
    });
    await flushPromises();
    expect(wrapper.findComponent({ name: "Title" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "Menu" }).exists()).toBe(true);
    expect(wrapper.find("nuxt-page-stub").exists()).toBe(true);
  });

  it("toggles the Activity component", async () => {
    const router = createTestRouter();
    router.push("/");
    await router.isReady();
    wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          "NuxtPage": true,
          "ClientOnly": true,
          "CyberpunkCity": true,
        },
      },
    });
    await flushPromises();
    const title = wrapper.findComponent({ name: "Title" });
    await title.vm.$emit("activity");
    await flushPromises();
    expect(wrapper.vm.activity).toBe(true);
    await title.vm.$emit("activity");
    await flushPromises();
    expect(wrapper.vm.activity).toBe(false);
  });

  it("toggles the Suggestion component", async () => {
    const router = createTestRouter();
    router.push("/");
    await router.isReady();
    wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          "NuxtPage": true,
          "ClientOnly": true,
          "CyberpunkCity": true,
        },
      },
    });
    await flushPromises();
    const title = wrapper.findComponent({ name: "Title" });
    await title.vm.$emit("joke");
    await flushPromises();
    expect(wrapper.vm.joke).toBe(true);
    await title.vm.$emit("joke");
    await flushPromises();
    expect(wrapper.vm.joke).toBe(false);
  });

  it("toggles the Checker component", async () => {
    const router = createTestRouter();
    router.push("/");
    await router.isReady();
    vi.useFakeTimers();
    wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          "NuxtPage": true,
          "ClientOnly": true,
          "CyberpunkCity": true,
        },
      },
    });
    await flushPromises();
    vi.advanceTimersByTime(2000);
    await flushPromises();
    const footer = wrapper.find("footer");
    await footer.trigger("click");
    await flushPromises();
    expect(wrapper.findComponent({ name: "Checker" }).exists()).toBe(true);
    vi.useRealTimers();
  });

  it("shows and hides the hint", async () => {
    const router = createTestRouter();
    router.push("/");
    await router.isReady();
    vi.useFakeTimers();
    wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          "NuxtPage": true,
          "ClientOnly": true,
          "CyberpunkCity": true,
          "TypingText": true,
        },
      },
    });
    await flushPromises();
    expect(wrapper.findComponent({ name: "TypingText" }).exists()).toBe(false);
    vi.advanceTimersByTime(2000);
    await flushPromises();
    expect(wrapper.findComponent({ name: "TypingText" }).exists()).toBe(true);
    vi.advanceTimersByTime(3000);
    await flushPromises();
    expect(wrapper.findComponent({ name: "TypingText" }).exists()).toBe(false);
    vi.useRealTimers();
  });

  it("updates the document title on route change", async () => {
    const router = createTestRouter();
    router.push("/");
    await router.isReady();
    wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          "NuxtPage": true,
          "ClientOnly": true,
          "CyberpunkCity": true,
        },
      },
    });
    await flushPromises();

    // In Nuxt migration, we switched to useHead for title management
    // We stubbed useHead above. We can check if it was called.
    expect(useHead).toHaveBeenCalledWith({ title: "Elliot > Home" });

    await router.push("/about");
    await flushPromises();
    expect(useHead).toHaveBeenCalledWith({ title: "Elliot > About Me" });

    await router.push("/non-existent-page");
    await flushPromises();
    expect(useHead).toHaveBeenCalledWith({ title: "Elliot > 404" });
  });
});