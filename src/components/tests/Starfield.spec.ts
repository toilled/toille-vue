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
      .mockImplementation((contextId) => {
        if (contextId === '2d') {
            return {
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
                clearRect: vi.fn(),
                drawImage: vi.fn(),
                translate: vi.fn(),
            } as any;
        }

        mockContext = {
          enable: vi.fn(),
          blendFunc: vi.fn(),
          createShader: vi.fn(() => ({})),
          shaderSource: vi.fn(),
          compileShader: vi.fn(),
          getShaderParameter: vi.fn(() => true),
          createProgram: vi.fn(() => ({})),
          attachShader: vi.fn(),
          linkProgram: vi.fn(),
          getProgramParameter: vi.fn(() => true),
          createBuffer: vi.fn(() => ({})),
          bindBuffer: vi.fn(),
          bufferData: vi.fn(),
          createTexture: vi.fn(),
          bindTexture: vi.fn(),
          texImage2D: vi.fn(),
          texParameteri: vi.fn(),
          getAttribLocation: vi.fn(() => 0),
          getUniformLocation: vi.fn(() => ({})),
          enableVertexAttribArray: vi.fn(),
          vertexAttribPointer: vi.fn(),
          uniform1i: vi.fn(),
          uniform1f: vi.fn(),
          uniform2f: vi.fn(),
          viewport: vi.fn(),
          clearColor: vi.fn(),
          clear: vi.fn(),
          useProgram: vi.fn(),
          activeTexture: vi.fn(),
          drawArrays: vi.fn(),
          deleteShader: vi.fn(),
          deleteTexture: vi.fn(),
          // Constants
          VERTEX_SHADER: 35633,
          FRAGMENT_SHADER: 35632,
          COMPILE_STATUS: 35713,
          LINK_STATUS: 35714,
          ARRAY_BUFFER: 34962,
          STATIC_DRAW: 35044,
          DYNAMIC_DRAW: 35048,
          BLEND: 3042,
          SRC_ALPHA: 770,
          ONE: 1,
          ONE_MINUS_SRC_ALPHA: 771,
          TEXTURE_2D: 3553,
          RGBA: 6408,
          UNSIGNED_BYTE: 5121,
          TEXTURE0: 33984,
          FLOAT: 5126,
          TRIANGLES: 4,
          POINTS: 0,
          LINES: 1,
          COLOR_BUFFER_BIT: 16384,
          CLAMP_TO_EDGE: 33071,
          LINEAR: 9729,
          TEXTURE_WRAP_S: 10242,
          TEXTURE_WRAP_T: 10243,
          TEXTURE_MIN_FILTER: 10241,
          TEXTURE_MAG_FILTER: 10240,
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

  it("calls drawArrays in the animation loop", async () => {
    const wrapper = mount(Starfield, {
      attachTo: document.body,
    });

    // Manually trigger the animation frame
    requestAnimationFrameMock.mock.calls[0][0](1000);
    await flushPromises();

    // Expect drawArrays to have been called
    expect(mockContext.drawArrays).toHaveBeenCalled();

    wrapper.unmount();
  });

  it("increments score when a star is clicked", async () => {
    // Mock window dimensions to be deterministic
    window.innerWidth = 1000;
    window.innerHeight = 1000;

    const wrapper = mount(Starfield, {
      attachTo: document.body,
    });

    // Mock getBoundingClientRect
    const canvas = wrapper.find('canvas').element;
    canvas.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 1000,
      height: 1000,
      right: 1000,
      bottom: 1000,
      x: 0,
      y: 0,
      toJSON: () => { }
    }));

    // Trigger animation to position stars
    // With Math.random() mocked to 0.5:
    // Star init:
    // x = random(-500, 500) -> 0.5 -> 0.
    // y = 0.
    // z = random(1, 1000) -> 500.5 -> 500.
    // Update: counter -= speed (10). -> 490.
    // ScreenX = centerX + (x/z)*width.
    // ScreenX = 500 + (0/490)*1000 = 500.
    // ScreenY = 500 + 0 = 500.

    // So star should be at 500, 500.

    // We need to advance at least one frame because update happens in loop
    requestAnimationFrameMock.mock.calls[0][0](1000);
    await flushPromises();

    // Click at the center of the canvas
    await wrapper.find('canvas').trigger('click', {
      clientX: 500,
      clientY: 500
    });

    expect(wrapper.find('.score-counter').text()).toBe("Score: 1");

    wrapper.unmount();
  });
});
