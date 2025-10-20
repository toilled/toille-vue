import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../../App.vue";
import { createRouter, createMemoryHistory } from "vue-router";
import flushPromises from "flush-promises";

const createTestRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "Home" } },
      { path: "/about", component: { template: "About" } },
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

describe("App.vue", () => {
  it("renders the main components", async () => {
    const router = createTestRouter();
    router.push("/");
    await router.isReady();
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          "router-view": true,
          "Starfield": true,
        },
      },
    });
    await flushPromises();
    expect(wrapper.findComponent({ name: "Title" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "Menu" }).exists()).toBe(true);
    expect(wrapper.find("router-view-stub").exists()).toBe(true);
  });

  it("toggles the Activity component", async () => {
    const router = createTestRouter();
    router.push("/");
    await router.isReady();
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          "Starfield": true,
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
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          "Starfield": true,
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
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          "Starfield": true,
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
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          "Starfield": true,
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
});