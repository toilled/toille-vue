import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApp = {
  use: vi.fn(),
  mount: vi.fn(),
};

import * as actualVue from 'vue';

vi.doMock("vue", () => ({
  ...actualVue,
  createSSRApp: vi.fn(() => mockApp),
  createApp: vi.fn(() => mockApp),
  defineComponent: vi.fn((comp) => comp),
  ref: vi.fn(),
  onMounted: vi.fn(),
  computed: vi.fn(),
  watch: vi.fn(),
}));

const mockRouter = {
  push: vi.fn(),
};

vi.doMock("vue-router", () => ({
  createRouter: vi.fn(() => mockRouter),
  createWebHistory: vi.fn(),
  createMemoryHistory: vi.fn(),
  useRoute: vi.fn(() => ({ params: {} })),
}));

describe("main.ts", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates a Vue app with the App component", async () => {
    const { createSSRApp } = await import("vue");
    const { createApp } = await import("../main");
    createApp();
    expect(createSSRApp).toHaveBeenCalledWith(expect.objectContaining({ __name: "App" }));
  });

  it("creates a router with the correct routes", async () => {
    const { createRouter } = await import("vue-router");
    const { createApp } = await import("../main");
    createApp();
    expect(createRouter).toHaveBeenCalledWith(expect.objectContaining({
      history: undefined,
    }));
  });

  it("uses the router", async () => {
    const { createApp } = await import("../main");
    createApp();
    expect(mockApp.use).toHaveBeenCalledWith(mockRouter);
  });
});
