import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApp = {
  use: vi.fn(),
  mount: vi.fn(),
};

vi.doMock("vue", () => ({
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
  useRoute: vi.fn(() => ({ params: {} })),
}));

describe("main.ts", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates a Vue app with the App component", async () => {
    const { createApp } = await import("vue");
    await import("../main");
    expect(createApp).toHaveBeenCalledWith(expect.objectContaining({ __name: "App" }));
  });

  it("creates a router with the correct routes", async () => {
    const { createRouter } = await import("vue-router");
    await import("../main");
    expect(createRouter).toHaveBeenCalledWith({
      history: undefined,
      routes: [
        { path: "/", component: expect.any(Object), props: { name: "home" } },
        { path: "/:name", component: expect.any(Object), props: true },
        { path: "/checker", component: expect.any(Function) },
        { path: "/game", component: expect.any(Function) },
        { path: "/noughts-and-crosses", component: expect.any(Function) },
        { path: "/ask", component: expect.any(Function) },
        { path: "/:pathMatch(.*)*", component: expect.any(Object) },
      ],
    });
  });

  it("uses the router and mounts the app", async () => {
    await import("../main");
    expect(mockApp.use).toHaveBeenCalledWith(mockRouter);
    expect(mockApp.mount).toHaveBeenCalledWith("#app");
  });
});