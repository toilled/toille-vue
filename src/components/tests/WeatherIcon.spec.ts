import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import WeatherIcon from "../WeatherIcon.vue";

describe("WeatherIcon.vue", () => {
  // Use a date that matches the mock data hour
  const MOCK_DATE = new Date("2023-10-27T10:00:00Z");

  const mockHourlyData = [
    { time: "10:00", temp: 10, rain: 0 },
    { time: "11:00", temp: 11, rain: 0.5 },
    { time: "12:00", temp: 12, rain: 1.2 },
    { time: "13:00", temp: 13, rain: 0.8 },
    { time: "14:00", temp: 14, rain: 0 },
    { time: "15:00", temp: 15, rain: 0 },
  ];

  beforeEach(() => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          current_weather: {
            weathercode: 0,
            temperature: 20,
          },
          hourly: mockHourlyData,
        }),
    });
    vi.stubGlobal("fetch", mockFetch);
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("fetches weather and displays sun icon for clear sky", async () => {
    const wrapper = mount(WeatherIcon);

    await flushPromises();

    expect(fetch).toHaveBeenCalledWith("/api/weather");
    expect(wrapper.find(".icon-wrapper").attributes("title")).toBe(
      "Clear Sky (20°C) in Cheltenham, UK",
    );
    expect(wrapper.find("svg").exists()).toBe(true);
    expect(wrapper.find("circle").exists()).toBe(true);
  });

  it("opens modal on click and displays rain data", async () => {
    const wrapper = mount(WeatherIcon);

    await flushPromises();

    // Modal should be hidden initially
    expect(document.querySelector(".weather-modal-overlay")).toBeNull();

    // Click icon
    await wrapper.find(".icon-wrapper").trigger("click");
    await wrapper.vm.$nextTick();

    // Modal should be visible
    expect(document.querySelector(".weather-modal-overlay")).not.toBeNull();

    // Check graph elements
    const chart = document.querySelector(".chart-container svg");
    expect(chart).not.toBeNull();

    // Check for rain bars
    const rainBars = document.querySelectorAll("rect.rain-bar");
    expect(rainBars.length).toBeGreaterThan(0);

    // Close modal
    const closeBtn = document.querySelector(".close-btn");
    closeBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(document.querySelector(".weather-modal-overlay")).toBeNull();
  });
});
