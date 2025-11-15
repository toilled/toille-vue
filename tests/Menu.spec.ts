import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Menu from "../components/Menu.vue";
import MenuItem from "../components/MenuItem.vue";
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
});
