import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import Quiz from '../Quiz.vue';

// Use a mock for useHead from @vueuse/head
vi.mock("@vueuse/head", () => ({
  useHead: vi.fn(),
}));

describe('Quiz.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly and displays a question', async () => {
    const wrapper = mount(Quiz);

    // Wait for initial random question to load (onMounted)
    await wrapper.vm.$nextTick();

    expect(wrapper.find('h2').text()).toBe('Pub Quiz');
    expect(wrapper.find('.question').exists()).toBe(true);
    expect(wrapper.findAll('.options button').length).toBeGreaterThan(0);
  });

  it('handles a correct answer', async () => {
    // We mock Math.random to always pick the first question
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const wrapper = mount(Quiz);
    await wrapper.vm.$nextTick();

    // The first question from the component is "What is the capital of France?" (index 0)
    // Correct index is 2 (Paris)
    const options = wrapper.findAll('.options button');

    // Click correct answer
    await options[2].trigger('click');

    // Check if result is displayed
    const result = wrapper.find('.result');
    expect(result.exists()).toBe(true);
    expect(result.classes()).toContain('correct');
    expect(result.text()).toContain('Correct!');

    // Check if 'correct-option' class was applied to the correct button
    expect(options[2].classes()).toContain('correct-option');

    randomSpy.mockRestore();
  });

  it('handles a wrong answer', async () => {
    // We mock Math.random to always pick the first question
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const wrapper = mount(Quiz);
    await wrapper.vm.$nextTick();

    // Click wrong answer
    const options = wrapper.findAll('.options button');
    await options[0].trigger('click'); // Berlin

    // Check if result is displayed
    const result = wrapper.find('.result');
    expect(result.exists()).toBe(true);
    expect(result.classes()).toContain('wrong');
    expect(result.text()).toContain('Wrong!');
    expect(result.text()).toContain('The correct answer was: Paris');

    // Check classes on options
    expect(options[0].classes()).toContain('wrong-option');
    expect(options[2].classes()).toContain('correct-option');

    randomSpy.mockRestore();
  });

  it('loads next question when button is clicked', async () => {
    let randomValue = 0; // Selects first question
    const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
        return randomValue;
    });

    const wrapper = mount(Quiz);
    await wrapper.vm.$nextTick();

    const initialQuestionText = wrapper.find('.question').text();

    // Answer the question
    await wrapper.findAll('.options button')[0].trigger('click');

    // Verify "Next Question" button exists and click it
    const nextBtn = wrapper.find('.result button');
    expect(nextBtn.exists()).toBe(true);

    // Setup random to pick a different question (e.g. index 1)
    // The component might call Math.random again to avoid duplicates,
    // but returning a value > 0 that maps to index 1 will do.
    randomValue = 1 / 10; // Selects index 1 if length is 10

    await nextBtn.trigger('click');

    const newQuestionText = wrapper.find('.question').text();
    expect(newQuestionText).not.toBe(initialQuestionText);

    // The result should disappear
    expect(wrapper.find('.result').exists()).toBe(false);

    randomSpy.mockRestore();
  });
});
