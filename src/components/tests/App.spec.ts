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
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
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
    const { getByText, queryByText } = render(App);
    const title = getByText("Main Title");

    expect(queryByText("Try this")).toBeFalsy();

    await fireEvent.mouseDown(title);
    await tick();

    await waitFor(() => {
        expect(queryByText("The Bored API")).toBeTruthy();
    });
  });

  it("toggles the Suggestion component", async () => {
    const { getByText, queryByText } = render(App);
    const subtitle = getByText("Main Subtitle");

    expect(queryByText("Have a laugh!")).toBeFalsy();

    await fireEvent.mouseDown(subtitle);
    await tick();

    expect(queryByText("Have a laugh!")).toBeTruthy();
  });

  it("toggles the Checker component", async () => {
    vi.useFakeTimers();
    const { getByText, container } = render(App);

    vi.advanceTimersByTime(2100);
    await tick();

    // Check if hint is visible first
    const footer = getByText("The titles might be clickable...");
    await fireEvent.click(footer);
    await tick();

    expect(getByText("Alcohol Checker")).toBeTruthy();
    vi.useRealTimers();
  });

  it("shows and hides the hint", async () => {
    vi.useFakeTimers();
    const { queryByText } = render(App);

    expect(queryByText("The titles might be clickable...")).toBeFalsy();

    // Show hint
    vi.advanceTimersByTime(2100);
    await tick();
    expect(queryByText("The titles might be clickable...")).toBeTruthy();

    // Hide hint
    vi.advanceTimersByTime(3100); // 2100 + 3100 > 5000
    await tick();
    expect(queryByText("The titles might be clickable...")).toBeFalsy();
    vi.useRealTimers();
  });

  it("updates the document title on route change", async () => {
    render(App);
    await tick();
    expect(document.title).toBe("Elliot > Home");

    path.set("/about");
    await tick();
    await new Promise(r => setTimeout(r, 0));
    expect(document.title).toBe("Elliot > About Me");

    path.set("/non-existent-page");
    await tick();
    await new Promise(r => setTimeout(r, 0));
    expect(document.title).toBe("Elliot > 404");
  });
});
