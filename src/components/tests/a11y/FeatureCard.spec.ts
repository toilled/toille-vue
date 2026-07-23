import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { configureAxe } from 'vitest-axe';
import FeatureCard from '../../FeatureCard.vue';

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

const defaultProvide = {
  navigateToSection: vi.fn(),
};

const runAxe = configureAxe({
  rules: {
    region: { enabled: false },
  },
});

describe('FeatureCard.vue a11y', () => {
  function mountCard(props: Record<string, unknown> = {}) {
    return mount(FeatureCard, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      props: props as any,
      global: { provide: defaultProvide },
    });
  }

  it('has no a11y violations without link', async () => {
    const wrapper = mountCard({
      icon: '🚀',
      title: 'Test Feature',
      description: 'A test description',
    });
    const results = await runAxe(wrapper.element);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations with link', async () => {
    const wrapper = mountCard({
      icon: '🚀',
      title: 'Test Feature',
      description: 'A test description',
      link: '/test',
    });
    const results = await runAxe(wrapper.element);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations with tags', async () => {
    const wrapper = mountCard({
      icon: '🚀',
      title: 'Test Feature',
      description: 'A test description',
      tags: ['Vue', 'TypeScript'],
    });
    const results = await runAxe(wrapper.element);
    expect(results).toHaveNoViolations();
  });
});
