import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StoryHint from '../StoryHint.vue';

describe('StoryHint.vue', () => {
  it('renders hint text when visible is true', () => {
    const wrapper = mount(StoryHint, {
      props: { visible: true },
    });
    expect(wrapper.find('#story-hint').exists()).toBe(true);
    expect(wrapper.text()).toContain('encrypted transmission');
  });

  it('does not render when visible is false', () => {
    const wrapper = mount(StoryHint, {
      props: { visible: false },
    });
    expect(wrapper.find('#story-hint').exists()).toBe(false);
  });
});
