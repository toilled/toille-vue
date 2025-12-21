import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Menu from "../Menu.vue";
import MenuItem from "../MenuItem.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: { template: "Home" } },
  { path: "/about", component: { template: "About" } },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

describe("Menu.vue", () => {
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
    });

    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a list of menu items", () => {
    const pages = [
      { name: "Home", link: "/" },
      { name: "About", link: "/about" },
    ];
    const wrapper = mount(Menu, {
      props: { pages },
      global: {
        plugins: [router],
      },
    });
    const menuItems = wrapper.findAllComponents(MenuItem);
    expect(menuItems.length).toBe(2);
    expect(menuItems[0].props("page")).toEqual({ name: "Home", link: "/" });
    expect(menuItems[1].props("page")).toEqual({
      name: "About",
      link: "/about",
    });
  });

  it("renders an empty list when no pages are provided", () => {
    const wrapper = mount(Menu, {
      props: { pages: [] },
      global: {
        plugins: [router],
      },
    });
    const menuItems = wrapper.findAllComponents(MenuItem);
    expect(menuItems.length).toBe(0);
  });

  it("emits 'fly' event when plane icon is clicked", async () => {
    const pages = [
      { name: "Home", link: "/" }
    ];
    const wrapper = mount(Menu, {
      props: { pages },
      global: {
        plugins: [router],
      },
    });

    // Find the fly icon wrapper
    const iconWrappers = wrapper.findAll('.icon-wrapper');
    // Assuming the second one is the plane icon based on my change
    // Order: Explore, Fly, Sound
    expect(iconWrappers.length).toBeGreaterThanOrEqual(2);
    const flyIcon = iconWrappers[1];

    // Check if it has the title "Fly Tour" to be sure
    expect(flyIcon.attributes('title')).toBe('Fly Tour');

    await flyIcon.trigger('click');
    expect(wrapper.emitted('fly')).toBeTruthy();
  });
});
