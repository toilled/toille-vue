import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import { configureAxe } from 'vitest-axe';
import MenuItem from '../../MenuItem.vue';

const runAxe = configureAxe({
  rules: {
    region: { enabled: false },
    listitem: { enabled: false },
  },
});

describe('MenuItem.vue a11y', () => {
  function mountItem(isActive = false) {
    return mount(MenuItem, {
      props: {
        page: { name: 'Home', link: '/', title: 'Home', body: [] },
      },
      global: {
        provide: {
          activeSection: ref(isActive ? 'home' : 'about'),
          navigateToSection: () => {},
        },
      },
    });
  }

  it('has no a11y violations when inactive', async () => {
    const wrapper = mountItem(false);
    const results = await runAxe(wrapper.element);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations when active', async () => {
    const wrapper = mountItem(true);
    const results = await runAxe(wrapper.element);
    expect(results).toHaveNoViolations();
  });
});
