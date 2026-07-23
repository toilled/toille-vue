import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { configureAxe } from 'vitest-axe';
import Menu from '../../Menu.vue';

const runAxe = configureAxe({
  rules: {
    region: { enabled: false },
  },
});

describe('Menu.vue a11y', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            current_weather: { weathercode: 0, temperature: 10 },
            hourly: {
              time: ['2023-10-27T00:00'],
              temperature_2m: [10],
              rain: [0],
            },
          }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const pages = [
    { name: 'Home', link: '/', title: 'Home', body: [] },
    { name: 'About', link: '/about', title: 'About', body: [] },
  ];

  function mountMenu(props = {}) {
    return mount(Menu, {
      props: { pages, contentVisible: true, cityFallback: false, ...props },
      global: {
        provide: {
          activeSection: { value: 'home' },
          navigateToSection: vi.fn(),
        },
      },
    });
  }

  it('has no a11y violations', async () => {
    const wrapper = mountMenu();
    const results = await runAxe(wrapper.element);
    expect(results).toHaveNoViolations();
  });
});
