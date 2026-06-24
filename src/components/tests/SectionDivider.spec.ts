import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SectionDivider from '../SectionDivider.vue';

describe('SectionDivider.vue', () => {
  it('renders dots when no icon', () => {
    const wrapper = mount(SectionDivider, { props: {} });
    expect(wrapper.findAll('.dot').length).toBe(3);
    expect(wrapper.find('.divider-icon').exists()).toBe(false);
  });

  it('renders icon when provided', () => {
    const wrapper = mount(SectionDivider, { props: { icon: '🚀' } });
    expect(wrapper.find('.divider-icon').exists()).toBe(true);
    expect(wrapper.text()).toContain('🚀');
    expect(wrapper.findAll('.dot').length).toBe(0);
  });

  it('renders divider lines', () => {
    const wrapper = mount(SectionDivider, { props: { icon: '🚀' } });
    expect(wrapper.findAll('.divider-line').length).toBe(2);
  });
});
