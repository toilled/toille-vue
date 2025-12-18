import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import WeatherIcon from '../WeatherIcon.vue';

describe('WeatherIcon.vue', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('fetches weather and displays sun icon for clear sky', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        current_weather: {
          weathercode: 0,
          temperature: 20
        }
      })
    });

    const wrapper = mount(WeatherIcon);

    // Wait for async fetch
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('api.open-meteo.com'));
    expect(wrapper.find('.icon-wrapper').attributes('title')).toBe('Clear Sky (20°C) in Cheltenham, UK');
    expect(wrapper.find('svg').exists()).toBe(true);
    // Check for sun specific elements
    expect(wrapper.find('circle').exists()).toBe(true);
  });

  it('displays cloud icon for overcast', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        current_weather: {
          weathercode: 3,
          temperature: 15
        }
      })
    });

    const wrapper = mount(WeatherIcon);

    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.icon-wrapper').attributes('title')).toBe('Partly Cloudy (15°C) in Cheltenham, UK');
    // Check for cloud path
    expect(wrapper.find('path').exists()).toBe(true);
  });

  it('handles fetch error gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const wrapper = mount(WeatherIcon);

    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Wait for the async operation in fetchWeather (triggered on mount) to complete
    // Because we mocked a rejection, the catch block runs and updates the state.

    expect(wrapper.find('.icon-wrapper').attributes('title')).toBe('Weather data unavailable');
    expect(wrapper.text()).toContain('?');
  });
});
