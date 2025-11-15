import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import App from "../app.vue";

describe("App.vue", () => {
  it("renders the main components and sets the title", async () => {
    const wrapper = await mountSuspended(App);
    expect(wrapper.findComponent({ name: "Title" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "Menu" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "NuxtPage" }).exists()).toBe(true);
    expect(document.title).toBe("Elliot > Home");
  });
});
