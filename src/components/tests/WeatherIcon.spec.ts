import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import WeatherIcon from '../WeatherIcon.vue';

describe('WeatherIcon.vue', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  // Use a date that matches the mock data hour
  const MOCK_DATE = new Date("2023-10-27T10:00:00Z");

  const mockHourlyData = {
    time: [
      "2023-10-27T10:00", "2023-10-27T11:00", "2023-10-27T12:00",
      "2023-10-27T13:00", "2023-10-27T14:00", "2023-10-27T15:00",
      "2023-10-27T16:00", "2023-10-27T17:00", "2023-10-27T18:00"
    ],
    temperature_2m: [10, 11, 12, 13, 14, 15, 14, 13, 12]
  };

  beforeEach(() => {
    mockFetch.mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
    // Create teleport target
    const el = document.createElement('div')
    el.id = 'modal-target'
    document.body.appendChild(el)
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('fetches weather and displays sun icon for clear sky', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        current_weather: {
          weathercode: 0,
          temperature: 20
        },
        hourly: mockHourlyData
      })
    });

    const wrapper = mount(WeatherIcon);

    await flushPromises();

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('api.open-meteo.com'));
    expect(wrapper.find('.icon-wrapper').attributes('title')).toBe('Clear Sky (20°C) in Cheltenham, UK');
    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.find('circle').exists()).toBe(true);
  });

  it('opens modal on click', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        current_weather: {
          weathercode: 0,
          temperature: 20
        },
        hourly: mockHourlyData
      })
    });

    // We do NOT stub Teleport, so it renders into the body
    const wrapper = mount(WeatherIcon);

    await flushPromises();

    // Modal should be hidden initially (not in body)
    expect(document.querySelector('.weather-modal-overlay')).toBeNull();

    // Click icon
    await wrapper.find('.icon-wrapper').trigger('click');
    await wrapper.vm.$nextTick();

    // Modal should be visible in body
    const overlay = document.querySelector('.weather-modal-overlay');
    expect(overlay).not.toBeNull();

    // Check graph elements in DOM
    const chart = document.querySelector('.chart-container svg');
    expect(chart).not.toBeNull();

    const polyline = document.querySelector('polyline');
    expect(polyline).not.toBeNull();

    // Close modal
    const closeBtn = document.querySelector('.close-btn');
    expect(closeBtn).not.toBeNull();
    closeBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // We need to wait for Vue to process the event
    await wrapper.vm.$nextTick();

    expect(document.querySelector('.weather-modal-overlay')).toBeNull();
  });
});
