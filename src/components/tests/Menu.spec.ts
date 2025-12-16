import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
    localStorage.clear();
    vi.restoreAllMocks();
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
    expect(menuItems[1].props("page")).toEqual({ name: "About", link: "/about" });
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

  it("toggles sound icon when clicked and updates localStorage", async () => {
    const wrapper = mount(Menu, {
      props: { pages: [] },
      global: { plugins: [router] },
    });

    // Default: Sound OFF (mute icon)
    let icon = wrapper.find('[data-testid="sound-off-icon"]');
    expect(icon.exists()).toBe(true);
    expect(localStorage.getItem('cyberpunk_sound_enabled')).toBeNull();

    // Click to toggle ON
    await wrapper.find('.icon-wrapper[title="Toggle Sound"]').trigger('click');

    // Sound ON (sound icon)
    icon = wrapper.find('[data-testid="sound-on-icon"]');
    expect(icon.exists()).toBe(true);
    expect(localStorage.getItem('cyberpunk_sound_enabled')).toBe('true');

    // Click to toggle OFF
    await wrapper.find('.icon-wrapper[title="Toggle Sound"]').trigger('click');

    // Sound OFF
    icon = wrapper.find('[data-testid="sound-off-icon"]');
    expect(icon.exists()).toBe(true);
    expect(localStorage.getItem('cyberpunk_sound_enabled')).toBe('false');
  });

  it("initializes sound based on localStorage", async () => {
    localStorage.setItem('cyberpunk_sound_enabled', 'true');

    const wrapper = mount(Menu, {
      props: { pages: [] },
      global: { plugins: [router] },
    });

    // Wait for any async effects
    await wrapper.vm.$nextTick();

    // Expect Sound ON
    const icon = wrapper.find('[data-testid="sound-on-icon"]');
    expect(icon.exists()).toBe(true);
  });
});
