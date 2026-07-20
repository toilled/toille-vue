import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { cityBackground } from '../CityBackgroundManager';

describe('CityBackgroundManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts enabled by default', () => {
    expect(cityBackground.isEnabled.value).toBe(true);
  });

  it('toggle changes enabled state', () => {
    cityBackground.toggle();
    expect(cityBackground.isEnabled.value).toBe(false);
    cityBackground.toggle();
    expect(cityBackground.isEnabled.value).toBe(true);
  });

  it('reads localStorage on init', () => {
    localStorage.setItem('city-background-enabled', 'false');
    cityBackground.init();
    expect(cityBackground.isEnabled.value).toBe(false);
  });

  it('persists state to localStorage after init', async () => {
    cityBackground.init();
    cityBackground.isEnabled.value = true;
    await nextTick();
    cityBackground.toggle();
    await nextTick();
    expect(localStorage.getItem('city-background-enabled')).toBe('false');
    cityBackground.toggle();
    await nextTick();
    expect(localStorage.getItem('city-background-enabled')).toBe('true');
  });
});
