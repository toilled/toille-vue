import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Chat from "../Chat.vue";

// Mock the mqtt library
const mockClient = {
  on: vi.fn(),
  subscribe: vi.fn(),
  publish: vi.fn(),
  end: vi.fn(),
  connected: true
};

vi.mock("mqtt", () => {
  return {
    default: {
      connect: vi.fn(() => mockClient)
    }
  };
});

describe("Chat.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.connected = true;
  });

  it("renders correctly", () => {
    const wrapper = mount(Chat);
    expect(wrapper.find("h2").text()).toBe("Chat Room");
  });

  it("sends a message when the form is submitted", async () => {
    const wrapper = mount(Chat);
    const input = wrapper.find("input[name='chat-input']");
    const form = wrapper.find("form");

    await input.setValue("Hello, world!");
    await form.trigger("submit");

    expect(mockClient.publish).toHaveBeenCalledWith(
      "toille-vue/cyberpunk/chat",
      expect.stringContaining("Hello, world!"),
      { qos: 0 }
    );
  });
});
