import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import Suggestion from "../Suggestion.vue";
import flushPromises from "flush-promises";
import { VApp } from "vuetify/components";
import { h } from "vue";

const mockSuggestion = {
  joke: "Why don't scientists trust atoms? Because they make up everything!",
};

beforeEach(() => {
  vi.spyOn(global, "fetch").mockResolvedValue({
    json: () => Promise.resolve(mockSuggestion),
  } as Response);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Suggestion.vue", () => {
  const mountOptions = {
    props: {
      url: "https://icanhazdadjoke.com/",
      valueName: "joke",
      title: "Dad Joke",
    },
  };

  it("fetches and displays a suggestion on mount", async () => {
    const wrapper = mount(VApp, {
        slots: { default: () => h(Suggestion, mountOptions.props) }
    });
    // Loading state text
    expect(wrapper.text()).toContain("https://icanhazdadjoke.com/ might be down.");
    await flushPromises();
    expect(wrapper.text()).toContain(mockSuggestion.joke);
    expect(wrapper.text()).toContain("Dad Joke");
  });

  it("fetches a new suggestion when clicked", async () => {
    const wrapper = mount(VApp, {
        slots: { default: () => h(Suggestion, mountOptions.props) }
    });
    await flushPromises();
    const newMockSuggestion = {
      joke: "I'm reading a book on anti-gravity. It's impossible to put down!",
    };
    // @ts-ignore
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve(newMockSuggestion),
    } as Response);

    await wrapper.findComponent(Suggestion).find('.v-card').trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain(newMockSuggestion.joke);
  });

  it("shows a loading state while fetching", async () => {
    const wrapper = mount(VApp, {
        slots: { default: () => h(Suggestion, mountOptions.props) }
    });
    expect(wrapper.text()).toContain("https://icanhazdadjoke.com/ might be down.");
    await flushPromises();
    expect(wrapper.text()).not.toContain("https://icanhazdadjoke.com/ might be down.");
  });

  it("hides the hint after the first click", async () => {
    const wrapper = mount(VApp, {
        slots: { default: () => h(Suggestion, mountOptions.props) }
    });
    await flushPromises();
    expect(wrapper.text()).toContain("Click to update");
    await wrapper.findComponent(Suggestion).find('.v-card').trigger("click");
    await flushPromises();
    expect(wrapper.text()).not.toContain("Click to update");
  });

  it("handles fetch errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    // @ts-ignore
    global.fetch.mockRejectedValue(new Error("API is down"));
    const wrapper = mount(VApp, {
        slots: { default: () => h(Suggestion, mountOptions.props) }
    });
    await flushPromises();
    expect(wrapper.text()).toContain("https://icanhazdadjoke.com/ might be down.");
    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error("API is down"));
    consoleErrorSpy.mockRestore();
  });

  it("displays the correct hover hint", async () => {
    const wrapper = mount(VApp, {
        slots: { default: () => h(Suggestion, mountOptions.props) }
    });
    await flushPromises();
    // Check the title prop on the VCard component
    const vCard = wrapper.findComponent({ name: 'VCard' });
    expect(vCard.props('title')).toBe("Click for a new joke");
  });
});
