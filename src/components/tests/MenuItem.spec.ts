import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { mount } from "@vue/test-utils";
import MenuItem from "../MenuItem.vue";

describe("MenuItem.vue", () => {
  it("renders the menu item with the correct link and text", () => {
    const activeSection = ref("home");
    const navigateToSection = (_id: string) => {};

    const wrapper = mount(MenuItem, {
      props: {
        page: { name: "Home", link: "/" },
      },
      global: {
        provide: {
          activeSection,
          navigateToSection,
        },
      },
    });
    const link = wrapper.find("a");
    expect(link.text()).toBe("Home");
    expect(link.attributes("href")).toBe("#home");
  });

  it("renders hash links correctly for about page", () => {
    const activeSection = ref("home");
    const navigateToSection = (_id: string) => {};

    const wrapper = mount(MenuItem, {
      props: {
        page: { name: "About", link: "/about" },
      },
      global: {
        provide: {
          activeSection,
          navigateToSection,
        },
      },
    });
    const link = wrapper.find("a");
    expect(link.text()).toBe("About");
    expect(link.attributes("href")).toBe("#about");
  });
});
