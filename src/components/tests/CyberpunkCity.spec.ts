import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/svelte";
import CyberpunkCity from "../CyberpunkCity.svelte";

// Mock dependencies
vi.mock("../../router", () => ({
  path: { subscribe: (fn: any) => { fn('/'); return () => {}; } }
}));

describe("CyberpunkCity.svelte", () => {
  it("renders correctly", () => {
    const { container } = render(CyberpunkCity);
    expect(container.querySelector("#cyberpunk-city")).toBeTruthy();
  });

  it("initializes Three.js scene on mount", async () => {
     const { container } = render(CyberpunkCity);
     // Since setupThree.ts mocks WebGLRenderer creating a canvas and logic appends it
     expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("cleans up on unmount", () => {
    const { unmount } = render(CyberpunkCity);
    unmount();
  });
});
