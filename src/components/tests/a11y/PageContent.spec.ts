import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { configureAxe } from 'vitest-axe';
import PageContent from '../../PageContent.vue';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: {},
    path: '/',
  })),
}));

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}));

const runAxe = configureAxe({
  rules: {
    region: { enabled: false },
  },
});

describe('PageContent.vue a11y', () => {
  function mountPage() {
    return mount(PageContent, {
      global: {
        provide: {
          activeSection: { value: 'home' },
          navigateToSection: vi.fn(),
        },
        stubs: {
          Paragraph: {
            template: '<div class="paragraph-stub"><slot /></div>',
            props: ['paragraph', 'last'],
          },
          PageSections: {
            template: '<div class="sections-stub"><slot /></div>',
            props: ['sections'],
          },
          PageNotFound: {
            template: '<div class="not-found-stub"><slot /></div>',
            props: ['name', 'pages'],
          },
        },
      },
    });
  }

  it('has no a11y violations', async () => {
    const wrapper = mountPage();
    const results = await runAxe(wrapper.element);
    expect(results).toHaveNoViolations();
  });
});
