import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Ask from '../Ask.vue';

describe('Ask.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly', async () => {
    const wrapper = mount(Ask);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('h2').text()).toBe('Ask Me');
    expect(wrapper.find('input').exists()).toBe(true);
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('adds user message and bot response', async () => {
    const wrapper = mount(Ask);
    await wrapper.vm.$nextTick();

    // Initial bot message should be there
    expect(wrapper.findAll('.message').length).toBe(1);
    expect(wrapper.find('.message.bot').text()).toContain("Hello! I'm an automated assistant");

    const input = wrapper.find('input');
    const form = wrapper.find('form');

    // User types
    await input.setValue('What is your name?');
    await form.trigger('submit');

    // Verify user message is added
    // If isTyping is true, there is a .message.bot with "Typing..."
    // So messages: Initial + User + Typing = 3

    expect(wrapper.findAll('.message').length).toBe(3);
    expect(wrapper.findAll('.message')[1].text()).toBe('What is your name?');
    expect(wrapper.findAll('.message')[2].text()).toBe('Typing...');
    expect(input.element.value).toBe('');

    // Fast forward time
    await vi.advanceTimersByTimeAsync(1000);
    await wrapper.vm.$nextTick();

    // Verify bot response
    const messages = wrapper.findAll('.message');
    // Typing indicator should be gone.
    // Messages: Initial + User + Answer = 3

    expect(messages.length).toBe(3);
    const lastMessage = messages[messages.length - 1];
    expect(lastMessage.classes()).toContain('bot');
    expect(lastMessage.text()).not.toBe('Typing...');
    expect(lastMessage.text()).toContain('My name is Elliot.');
    expect(lastMessage.text()).not.toContain('Also, one reason I\'d be good for you is that');
  });

  it('disables input while typing', async () => {
    const wrapper = mount(Ask);
    await wrapper.vm.$nextTick();

    await wrapper.find('input').setValue('Hello');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.find('input').element.disabled).toBe(true);
    expect(wrapper.find('button').element.disabled).toBe(true);

    await vi.advanceTimersByTimeAsync(1000);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('input').element.disabled).toBe(false);
    expect(wrapper.find('button').element.disabled).toBe(true); // Empty input
  });
});
