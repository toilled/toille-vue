import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import Suggestion from "../components/Suggestion.vue";
import flushPromises from "flush-promises";

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
  it("fetches and displays a suggestion on mount", async () => {
    const wrapper = mount(Suggestion, {
      props: {
        url: "https://icanhazdadjoke.com/",
        valueName: "joke",
        title: "Dad Joke",
      },
    });
    expect(wrapper.text()).toContain("https://icanhazdadjoke.com/ might be down.");
    await flushPromises();
    expect(wrapper.text()).toContain(mockSuggestion.joke);
    expect(wrapper.text()).toContain("Dad Joke");
  });

  it("fetches a new suggestion when clicked", async () => {
    const wrapper = mount(Suggestion, {
      props: {
        url: "https://icanhazdadjoke.com/",
        valueName: "joke",
        title: "Dad Joke",
      },
    });
    await flushPromises();
    const newMockSuggestion = {
      joke: "I'm reading a book on anti-gravity. It's impossible to put down!",
    };
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve(newMockSuggestion),
    } as Response);
    await wrapper.trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain(newMockSuggestion.joke);
  });

  it("shows a loading state while fetching", async () => {
    const wrapper = mount(Suggestion, {
      props: {
        url: "https://icanhazdadjoke.com/",
        valueName: "joke",
        title: "Dad Joke",
      },
    });
    expect(wrapper.text()).toContain("https://icanhazdadjoke.com/ might be down.");
    await flushPromises();
    expect(wrapper.text()).not.toContain("https://icanhazdadjoke.com/ might be down.");
  });

  it("hides the hint after the first click", async () => {
    const wrapper = mount(Suggestion, {
      props: {
        url: "https://icanhazdadjoke.com/",
        valueName: "joke",
        title: "Dad Joke",
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain("Click to update");
    await wrapper.trigger("click");
    await flushPromises();
    expect(wrapper.text()).not.toContain("Click to update");
  });

  it("handles fetch errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    global.fetch.mockRejectedValue(new Error("API is down"));
    const wrapper = mount(Suggestion, {
      props: {
        url: "https://icanhazdadjoke.com/",
        valueName: "joke",
        title: "Dad Joke",
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain("https://icanhazdadjoke.com/ might be down.");
    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error("API is down"));
    consoleErrorSpy.mockRestore();
  });

  it("displays the correct hover hint", async () => {
    const wrapper = mount(Suggestion, {
      props: {
        url: "https://icanhazdadjoke.com/",
        valueName: "joke",
        title: "Dad Joke",
      },
    });
    await flushPromises();
    expect(wrapper.find("article").attributes("title")).toBe("Click for a new joke");
  });
});
