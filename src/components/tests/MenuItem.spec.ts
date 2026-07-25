import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import MenuItem from '../MenuItem.vue';

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useRoute: vi.fn(() => ({ path: '/' })),
}));

describe('MenuItem.vue', () => {
  it('renders the menu item with the correct link and text', () => {
    const activeSection = ref('home');
    const navigateToSection = (_id: string) => {};

    const wrapper = mount(MenuItem, {
      props: {
        page: { name: 'Home', link: '/', title: 'Home', body: [] },
      },
      global: {
        provide: {
          activeSection,
          navigateToSection,
        },
      },
    });
    const link = wrapper.find('a');
    expect(link.text()).toBe('Home');
    expect(link.attributes('href')).toBe('#home');
  });

  it('renders hash links correctly for about page', () => {
    const activeSection = ref('home');
    const navigateToSection = (_id: string) => {};

    const wrapper = mount(MenuItem, {
      props: {
        page: { name: 'About', link: '/about', title: 'About', body: [] },
      },
      global: {
        provide: {
          activeSection,
          navigateToSection,
        },
      },
    });
    const link = wrapper.find('a');
    expect(link.text()).toBe('About');
    expect(link.attributes('href')).toBe('#about');
  });
});
