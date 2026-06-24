import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FeatureCard from '../FeatureCard.vue';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

const defaultProvide = {
  navigateToSection: vi.fn(),
};

describe('FeatureCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mountWithProvide(props: Record<string, unknown> = {}) {
    return mount(FeatureCard, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      props: props as any,
      global: { provide: defaultProvide },
    });
  }

  it('renders icon, title, and description', () => {
    const wrapper = mountWithProvide({ icon: '🚀', title: 'Test', description: 'Desc' });
    expect(wrapper.text()).toContain('🚀');
    expect(wrapper.text()).toContain('Test');
    expect(wrapper.text()).toContain('Desc');
  });

  it('renders tags when provided', () => {
    const wrapper = mountWithProvide({
      icon: '🚀',
      title: 'Test',
      description: 'Desc',
      tags: ['tag1', 'tag2'],
    });
    expect(wrapper.text()).toContain('tag1');
    expect(wrapper.text()).toContain('tag2');
  });

  it('renders arrow when link is provided', () => {
    const wrapper = mountWithProvide({
      icon: '🚀',
      title: 'Test',
      description: 'Desc',
      link: '/test',
    });
    expect(wrapper.text()).toContain('→');
  });

  it('calls router.push for route links', async () => {
    const wrapper = mountWithProvide({
      icon: '🚀',
      title: 'Test',
      description: 'Desc',
      link: '/test',
    });
    await wrapper.trigger('click');
    expect(mockPush).toHaveBeenCalledWith('/test');
  });

  it('calls navigateToSection for hash links', async () => {
    const wrapper = mount(FeatureCard, {
      props: { icon: '🚀', title: 'Test', description: 'Desc', link: '#section', isHash: true },
      global: { provide: { navigateToSection: defaultProvide.navigateToSection } },
    });
    await wrapper.trigger('click');
    expect(defaultProvide.navigateToSection).toHaveBeenCalledWith('section');
  });

  it('opens external links in new window', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const wrapper = mountWithProvide({
      icon: '🚀',
      title: 'Test',
      description: 'Desc',
      link: 'https://example.com',
    });
    await wrapper.trigger('click');
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener noreferrer');
    openSpy.mockRestore();
  });

  it('does nothing when no link', async () => {
    const wrapper = mountWithProvide({ icon: '🚀', title: 'Test', description: 'Desc' });
    await wrapper.trigger('click');
    expect(mockPush).not.toHaveBeenCalled();
  });
});
