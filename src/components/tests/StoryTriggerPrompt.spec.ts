import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StoryTriggerPrompt from '../StoryTriggerPrompt.vue';

describe('StoryTriggerPrompt.vue', () => {
  it('renders prompt text when visible is true', () => {
    const wrapper = mount(StoryTriggerPrompt, {
      props: { visible: true },
    });
    expect(wrapper.find('#story-trigger-prompt').exists()).toBe(true);
    expect(wrapper.text()).toContain('EXAMINE DEAD DROP');
  });

  it('does not render when visible is false', () => {
    const wrapper = mount(StoryTriggerPrompt, {
      props: { visible: false },
    });
    expect(wrapper.find('#story-trigger-prompt').exists()).toBe(false);
  });
});
