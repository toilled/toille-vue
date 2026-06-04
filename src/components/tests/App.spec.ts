import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../../App.vue";
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

async function mountApp(stubs: Record<string, unknown> = {}) {
  const router = createTestRouter();
  router.push("/");
  await router.isReady();
  const app = mount(App, {
    global: {
      plugins: [router],
      stubs: { Starfield: true, ...stubs },
    },
  });
  await flushPromises();
  return app;
}

async function scrollToBottom(el: any) {
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: 2000,
    configurable: true,
  });
  window.innerHeight = 800;
  window.scrollY = 1200;
  window.dispatchEvent(new Event("scroll"));
  await new Promise((r) => setTimeout(r, 30));
  await flushPromises();
}

describe("App.vue", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;

  beforeEach(() => {
    const mockWeatherData = {
      current_weather: {
        weathercode: 0,
        temperature: 10,
      },
      hourly: {
        time: [
          "2023-10-27T00:00",
          "2023-10-27T01:00",
          "2023-10-27T02:00",
          "2023-10-27T03:00",
          "2023-10-27T04:00",
          "2023-10-27T05:00",
        ],
        temperature_2m: [10, 11, 12, 13, 14, 15],
        rain: [0, 0, 0, 0, 0, 0],
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWeatherData),
      headers: {
        get: vi.fn(),
      },
    });

    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.unstubAllGlobals();
  });

  it("renders the main components", async () => {
    wrapper = await mountApp({ "router-view": true });
    expect(wrapper.findComponent({ name: "Title" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "Menu" }).exists()).toBe(true);
    expect(wrapper.find("router-view-stub").exists()).toBe(true);
  });

  it("toggles the Activity component", async () => {
    wrapper = await mountApp();
    const title = wrapper.findComponent({ name: "Title" });
    await title.vm.$emit("activity");
    await flushPromises();
    expect(wrapper.vm.activity).toBe(true);
    await title.vm.$emit("activity");
    await flushPromises();
    expect(wrapper.vm.activity).toBe(false);
  });

  it("toggles the Suggestion component", async () => {
    wrapper = await mountApp();
    const title = wrapper.findComponent({ name: "Title" });
    await title.vm.$emit("joke");
    await flushPromises();
    expect(wrapper.vm.joke).toBe(true);
    await title.vm.$emit("joke");
    await flushPromises();
    expect(wrapper.vm.joke).toBe(false);
  });

  it("toggles the Checker component", async () => {
    wrapper = await mountApp();

    await scrollToBottom(wrapper);

    const footer = wrapper.find("footer");
    await footer.trigger("click");
    await flushPromises();
    expect(wrapper.findComponent({ name: "Checker" }).exists()).toBe(true);
  });

  it("shows and hides the hint on scroll", async () => {
    wrapper = await mountApp({ TypingText: true });
    expect(wrapper.findComponent({ name: "TypingText" }).exists()).toBe(false);

    await scrollToBottom(wrapper);
    expect(wrapper.findComponent({ name: "TypingText" }).exists()).toBe(true);

    window.scrollY = 0;
    window.dispatchEvent(new Event("scroll"));
    await new Promise((r) => setTimeout(r, 30));
    await flushPromises();
    expect(wrapper.findComponent({ name: "TypingText" }).exists()).toBe(false);
  });

  it("updates the document title on route change", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", component: { template: "Home" } },
        { path: "/about", component: { template: "About" } },
        { path: "/checker", component: { template: "Checker" } },
        { path: "/ask", component: { template: "Ask" } },
        { path: "/:pathMatch(.*)*", component: { template: "NotFound" } },
      ],
    });
    router.push("/");
    await router.isReady();
    wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          "router-view": true,
          Starfield: true,
        },
      },
    });
    await flushPromises();
    expect(document.title).toBe("Elliot > Home");

    await router.push("/checker");
    await flushPromises();
    expect(document.title).toBe("Elliot > Checker");

    await router.push("/ask");
    await flushPromises();
    expect(document.title).toBe("Elliot > Ask Me");

    await router.push("/about");
    await flushPromises();
    expect(document.title).toBe("Elliot > Home");
  });
});
