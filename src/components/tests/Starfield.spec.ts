import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Starfield from "../Starfield.vue";
import flushPromises from "flush-promises";

describe("Starfield.vue", () => {
  let getContextMock;
  let requestAnimationFrameMock;
  let performanceNowMock;
  let mathRandomMock;
  let mockContext: any;

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock the canvas getContext method as it's not supported in jsdom
    getContextMock = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockImplementation(() => {
        mockContext = {
          createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          fillStyle: "",
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          fill: vi.fn(),
          arc: vi.fn(),
          fillRect: vi.fn(),
          drawImage: vi.fn(),
          translate: vi.fn(),
          save: vi.fn(),
          rotate: vi.fn(),
          restore: vi.fn(),
        };
        return mockContext as any;
      });

    // Mock requestAnimationFrame to control the animation loop
    requestAnimationFrameMock = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb) => {
        // We only want to execute the callback once to avoid an infinite loop
        // in the test environment.
        return 0;
      });

    // Mock performance.now to control the timing of the animation
    performanceNowMock = vi.spyOn(performance, "now").mockReturnValue(0);

    // Mock Math.random to make the star generation deterministic
    mathRandomMock = vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    // Restore the original implementations after each test
    getContextMock.mockRestore();
    requestAnimationFrameMock.mockRestore();
    performanceNowMock.mockRestore();
    mathRandomMock.mockRestore();
    vi.useRealTimers();
  });

  it("renders without errors when attached to the DOM", () => {
    const wrapper = mount(Starfield, {
      attachTo: document.body,
    });

    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });

  it("calls drawStar in the animation loop", async () => {
    const wrapper = mount(Starfield, {
      attachTo: document.body,
    });

    // Manually trigger the animation frame
    requestAnimationFrameMock.mock.calls[0][0](1000);
    await flushPromises();

    // Expect the fill method of the context to have been called,
    // which is a good indicator that the star is being drawn.
    expect(mockContext.fill).toHaveBeenCalled();

    wrapper.unmount();
  });
});
