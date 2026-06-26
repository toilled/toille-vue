import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Suggestion from '../Suggestion.vue';

const mockSuggestion = {
  joke: "Why don't scientists trust atoms? Because they make up everything!",
};

describe('Suggestion.vue', () => {
  beforeEach(() => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      json: () => Promise.resolve(mockSuggestion),
    } as Response);
  });

  afterEach(() => {
    vi.mocked(globalThis.fetch).mockReset();
  });

  it('fetches and displays a suggestion on mount', async () => {
    const wrapper = mount(Suggestion, {
      props: {
        url: 'https://icanhazdadjoke.com/',
        valueName: 'joke',
        title: 'Dad Joke',
      },
    });
    expect(wrapper.text()).toContain('https://icanhazdadjoke.com/ suggestionDown');
    await new Promise((resolve) => setTimeout(resolve));
    expect(wrapper.text()).toContain(mockSuggestion.joke);
    expect(wrapper.text()).toContain('Dad Joke');
  });

  it('fetches a new suggestion when clicked', async () => {
    const wrapper = mount(Suggestion, {
      props: {
        url: 'https://icanhazdadjoke.com/',
        valueName: 'joke',
        title: 'Dad Joke',
      },
    });
    await new Promise((resolve) => setTimeout(resolve));
    const newMockSuggestion = {
      joke: "I'm reading a book on anti-gravity. It's impossible to put down!",
    };
    vi.mocked(globalThis.fetch).mockResolvedValue({
      json: () => Promise.resolve(newMockSuggestion),
    } as Response);
    await wrapper.trigger('click');
    await new Promise((resolve) => setTimeout(resolve));
    expect(wrapper.text()).toContain(newMockSuggestion.joke);
  });

  it('shows a loading state while fetching', async () => {
    const wrapper = mount(Suggestion, {
      props: {
        url: 'https://icanhazdadjoke.com/',
        valueName: 'joke',
        title: 'Dad Joke',
      },
    });
    expect(wrapper.text()).toContain('https://icanhazdadjoke.com/ suggestionDown');
    await new Promise((resolve) => setTimeout(resolve));
    expect(wrapper.text()).not.toContain('https://icanhazdadjoke.com/ suggestionDown');
  });

  it('hides the hint after the first click', async () => {
    const wrapper = mount(Suggestion, {
      props: {
        url: 'https://icanhazdadjoke.com/',
        valueName: 'joke',
        title: 'Dad Joke',
      },
    });
    await new Promise((resolve) => setTimeout(resolve));
    expect(wrapper.text()).toContain('suggestion.clickToUpdate');
    await wrapper.trigger('click');
    await new Promise((resolve) => setTimeout(resolve));
    expect(wrapper.text()).not.toContain('suggestion.clickToUpdate');
  });

  it('handles fetch errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('API is down'));
    const wrapper = mount(Suggestion, {
      props: {
        url: 'https://icanhazdadjoke.com/',
        valueName: 'joke',
        title: 'Dad Joke',
      },
    });
    await new Promise((resolve) => setTimeout(resolve));
    expect(wrapper.text()).toContain('https://icanhazdadjoke.com/ suggestionDown');
    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('API is down'));
    consoleErrorSpy.mockRestore();
    vi.mocked(globalThis.fetch).mockReset();
  });

  it('displays the correct hover hint', async () => {
    const wrapper = mount(Suggestion, {
      props: {
        url: 'https://icanhazdadjoke.com/',
        valueName: 'joke',
        title: 'Dad Joke',
      },
    });
    await new Promise((resolve) => setTimeout(resolve));
    expect(wrapper.find('article').attributes('title')).toBe('suggestion.clickForNew');
  });
});
