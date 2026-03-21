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
    wrapper = mount(App, {
      global: {
        stubs: {
          "router-view": true,
          Starfield: true,
          CyberpunkCity: true,
          SplashScreen: true,
          Taskbar: true,
          WindowComponent: true
        },
      },
    });
    await flushPromises();
    expect(wrapper.findComponent({ name: "Taskbar" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "SplashScreen" }).exists()).toBe(true);
  });

});
