import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MenuItem from "../components/MenuItem.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [{ path: "/", component: { template: "Home" } }];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

describe("MenuItem.vue", () => {
  it("renders the menu item with the correct link and text", () => {
    const wrapper = mount(MenuItem, {
      props: {
        page: { name: "Home", link: "/" },
      },
      global: {
        plugins: [router],
      },
    });
    const link = wrapper.find("a");
    expect(link.text()).toBe("Home");
    expect(link.attributes("href")).toBe("/");
  });
});
