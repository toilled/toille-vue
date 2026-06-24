import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Title from '../Title.vue';

describe('Title.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the title and subtitle', () => {
    const wrapper = mount(Title, {
      props: {
        title: 'Test Title',
        subtitle: 'Test Subtitle',
      },
    });
    expect(wrapper.text()).toContain('Test Title');
    expect(wrapper.text()).toContain('Test Subtitle');
  });

  it('emits an "activity" event on title mousedown', async () => {
    const wrapper = mount(Title, {
      props: {
        title: 'Test Title',
        subtitle: 'Test Subtitle',
      },
    });
    await wrapper.find('.title.question').trigger('mousedown');
    expect(wrapper.emitted('activity')).toBeTruthy();
  });

  it('emits a "joke" event on subtitle mousedown', async () => {
    const wrapper = mount(Title, {
      props: {
        title: 'Test Title',
        subtitle: 'Test Subtitle',
      },
    });
    await wrapper.find('h2.subtitle.question').trigger('mousedown');
    expect(wrapper.emitted('joke')).toBeTruthy();
  });
});
