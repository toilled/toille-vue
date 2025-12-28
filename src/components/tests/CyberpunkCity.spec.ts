import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import CyberpunkCity from "../CyberpunkCity.vue";

// Mock dependencies
vi.mock("vue-router", () => ({
  useRoute: () => ({
    path: "/",
  }),
}));

// Mock THREE is handled by setupThree.ts which is globally configured

describe("CyberpunkCity.vue", () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    // Mock canvas context
    const mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      shadowColor: '',
      shadowBlur: 0,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      clearRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as any);

    wrapper = mount(CyberpunkCity, {
      attachTo: document.body,
    });
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
    vi.restoreAllMocks();
  });

  it("initially does not show the return button", () => {
    const button = wrapper.find("#return-button");
    expect(button.exists()).toBe(false);
  });

  it("shows return button when startFlyingTour is called", async () => {
    // Access the exposed method
    const vm = wrapper.vm as any;
    expect(vm.startFlyingTour).toBeDefined();

    vm.startFlyingTour();
    await wrapper.vm.$nextTick();

    const button = wrapper.find("#return-button");
    expect(button.exists()).toBe(true);
  });

  it("hides return button when return button is clicked", async () => {
    const vm = wrapper.vm as any;
    vm.startFlyingTour();
    await wrapper.vm.$nextTick();

    const button = wrapper.find("#return-button");
    expect(button.exists()).toBe(true);

    await button.trigger('click');
    expect(wrapper.emitted('game-end')).toBeTruthy();

    const buttonAfter = wrapper.find("#return-button");
    expect(buttonAfter.exists()).toBe(false);
  });
});
