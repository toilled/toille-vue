import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApp = {
  use: vi.fn(),
  mount: vi.fn(),
};

// Use vi.mock for cleaner hoisting
vi.mock("vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue")>();
  return {
    ...actual,
    createApp: vi.fn(() => mockApp),
  };
});

const mockRouter = {
  push: vi.fn(),
};

vi.mock("vue-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("vue-router")>();
    return {
        ...actual,
        createRouter: vi.fn(() => mockRouter),
        createWebHistory: vi.fn(),
    }
});

describe("main.ts", () => {
  beforeEach(() => {
    vi.resetModules();
    mockApp.use.mockClear();
    mockApp.mount.mockClear();
  });

  it("creates a Vue app with the App component", async () => {
    const { createApp } = await import("vue");
    await import("../main");
    expect(createApp).toHaveBeenCalled();
    const callArgs = vi.mocked(createApp).mock.calls[0][0];
    expect(callArgs).toBeDefined();
  });

  it("creates a router with the correct routes", async () => {
    const { createRouter } = await import("vue-router");
    await import("../main");
    expect(createRouter).toHaveBeenCalled();
    const routerConfig = vi.mocked(createRouter).mock.calls[0][0];
    // @ts-ignore
    expect(routerConfig.routes).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: "/" }),
        expect.objectContaining({ path: "/:name" }),
    ]));
  });

  it("uses the router and mounts the app", async () => {
    await import("../main");
    expect(mockApp.use).toHaveBeenCalledWith(mockRouter);
    // Also uses vuetify
    expect(mockApp.use).toHaveBeenCalledTimes(2);
    expect(mockApp.mount).toHaveBeenCalledWith("#app");
  });
});
