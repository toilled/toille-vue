import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import Paragraph from "../Paragraph.svelte";

describe("Paragraph.svelte", () => {
  it("renders the paragraph content", () => {
    const { getByText } = render(Paragraph, {
        paragraph: "This is a test paragraph.",
        last: false,
    });
    expect(getByText("This is a test paragraph.")).toBeTruthy();
  });

  it('applies the "marginless" class when `last` is true', () => {
    const { container } = render(Paragraph, {
        paragraph: "This is the last paragraph.",
        last: true,
    });
    const div = container.querySelector('div');
    expect(div?.classList.contains("marginless")).toBe(true);
  });

  it('does not apply the "marginless" class when `last` is false', () => {
    const { container } = render(Paragraph, {
        paragraph: "This is not the last paragraph.",
        last: false,
    });
    const div = container.querySelector('div');
    expect(div?.classList.contains("marginless")).toBe(false);
  });

  it("renders HTML content correctly", () => {
    const { container } = render(Paragraph, {
        paragraph: "<strong>Bold text</strong>",
        last: false,
    });
    expect(container.querySelector("strong")).toBeTruthy();
    expect(container.textContent).toContain("Bold text");
  });
});
