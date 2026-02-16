import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/svelte";
import App from "../../App.svelte";
import { path } from "../../router";
import { tick } from "svelte";

vi.mock("../../configs/pages.json", () => ({
  default: [
    { name: "Home", link: "/", title: "Home" },
    { name: "About", link: "/about", title: "About Me" },
  ],
}));

vi.mock("../../configs/titles.json", () => ({
  default: {
    title: "Main Title",
    subtitle: "Main Subtitle",
  },
}));

describe("App.svelte", () => {
  beforeEach(() => {
    const mockWeatherResponse = {
        current_weather: { weathercode: 0, temperature: 10 },
        hourly: { time: [], temperature_2m: [], rain: [] }
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWeatherResponse),
      headers: { get: vi.fn() },
    });
    vi.stubGlobal("fetch", mockFetch);
    path.set("/");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the main components", async () => {
    const { getByText, container } = render(App);
    await tick();
    expect(getByText("Main Title")).toBeTruthy();
    expect(getByText("Main Subtitle")).toBeTruthy();
    expect(container.querySelector(".menu-item")).toBeTruthy();
  });

  it("toggles the Activity component", async () => {
    // Override fetch for this test
    const mockActivity = { type: "education", activity: "Learn something new" };
    vi.stubGlobal("fetch", vi.fn((url) => {
        if (typeof url === 'string' && url.includes('bored')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockActivity),
                headers: { get: vi.fn() }
            });
        }
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
                current_weather: { weathercode: 0, temperature: 10 },
                hourly: { time: [], temperature_2m: [], rain: [] }
            }),
            headers: { get: vi.fn() }
        });
    }));

    const { getByText, queryByText } = render(App);
    const title = getByText("Main Title");

    expect(queryByText("Try this")).toBeFalsy();

    await fireEvent.mouseDown(title);
    await tick();

    await waitFor(() => {
        expect(queryByText(/The Bored API/)).toBeTruthy();
    });
  });

  it("toggles the Suggestion component", async () => {
    const { getByText, queryByText } = render(App);
    const subtitle = getByText("Main Subtitle");

    expect(queryByText("Have a laugh!")).toBeFalsy();

    await fireEvent.mouseDown(subtitle);
    await tick();

    await waitFor(() => {
        expect(queryByText("Have a laugh!")).toBeTruthy();
    });
  });

  it("toggles the Checker component", async () => {
    vi.useFakeTimers();
    const { getByText } = render(App);

    vi.advanceTimersByTime(2100);
    await tick();

    const footer = document.querySelector('footer.content-container');
    expect(footer).toBeTruthy();

    await fireEvent.click(footer!);
    await tick();

    expect(getByText("Alcohol Checker")).toBeTruthy();
    vi.useRealTimers();
  });

  it("shows and hides the hint", async () => {
    vi.useFakeTimers();
    render(App);

    // Helper to check for the specific footer with text
    const getFooter = () => {
        // The footer might be rendered but empty/different.
        // We look for the footer that contains the TypingText component
        // or just the footer.content-container that IS NOT the Checker or Activity or Suggestion.
        // But App.svelte logic:
        // {#if noFootersShowing && showHint && isContentVisible}
        //    <footer ...><TypingText ... /></footer>
        // {/if}
        // So checking if that specific footer exists is correct.
        // However, other components (Activity, Suggestion, Checker) also use footer.content-container?
        // Let's check App.svelte template again.
        // Yes: Activity uses footer.content-container. Suggestion uses footer.content-container. Checker uses footer.content-container.
        // But in this test, activity, joke, checker are false. So those footers shouldn't be there.
        return document.querySelector('footer.content-container');
    };

    expect(getFooter()).toBeFalsy();

    // Show hint: 2000ms
    vi.advanceTimersByTime(2100);
    await tick();
    expect(getFooter()).toBeTruthy();

    // Hide hint: 5000ms total.
    // The previous failure showed the footer still existing.
    // Svelte transition might keep it in DOM.
    // We need to advance enough time for transition (fade) to complete.
    // Default fade is 400ms?
    // Let's advance way more.
    vi.advanceTimersByTime(5000);
    await tick();

    // If it's still there, maybe `showHint` didn't flip back to false?
    // hintTimeout2 = setTimeout(() => showHint = false, 5000);
    // This is 5000ms from mount.
    // We advanced 2100.
    // We need to advance another 2900 to reach 5000.
    // Plus transition time.
    // So 2100 + 5000 = 7100 total from start. Should be enough.

    expect(getFooter()).toBeFalsy();
    vi.useRealTimers();
  });

  it("updates the document title on route change", async () => {
    render(App);
    await tick();
    expect(document.title).toBe("Elliot > Home");

    path.set("/about");
    await tick();
    await waitFor(() => {
        expect(document.title).toBe("Elliot > About Me");
    });

    path.set("/non-existent-page");
    await tick();
    await waitFor(() => {
        expect(document.title).toBe("Elliot > 404");
    });
  });
});
