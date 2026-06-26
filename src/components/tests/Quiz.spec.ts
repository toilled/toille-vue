import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Quiz from '../Quiz.vue';

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}));

describe('Quiz.vue', () => {
  function stubFetch(mockResponse: {
    response_code: number;
    results: Array<{
      question: string;
      correct_answer: string;
      incorrect_answers: string[];
    }>;
  }) {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)
    );
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders correctly and displays a question fetched from API', async () => {
    stubFetch({
      response_code: 0,
      results: [
        {
          question: 'What is the capital of France?',
          correct_answer: 'Paris',
          incorrect_answers: ['Berlin', 'Madrid', 'Rome'],
        },
      ],
    });

    const wrapper = mount(Quiz);

    // Initial state should be loading
    expect(wrapper.text()).toContain('quiz.loading');

    // Wait for fetch to complete and component to update
    await vi.waitFor(() => {
      expect(wrapper.find('.question').exists()).toBe(true);
    });

    expect(wrapper.find('h2').text()).toBe('quiz.title');
    expect(wrapper.find('.question').text()).toBe('What is the capital of France?');
    const options = wrapper.findAll('.options button');
    expect(options.length).toBe(4);
  });

  it('handles a correct answer', async () => {
    stubFetch({
      response_code: 0,
      results: [
        {
          question: 'What is 2+2?',
          correct_answer: '4',
          incorrect_answers: ['1', '2', '3'],
        },
      ],
    });

    const wrapper = mount(Quiz);

    await vi.waitFor(() => {
      expect(wrapper.find('.question').exists()).toBe(true);
    });

    const options = wrapper.findAll('.options button');

    // Find the button with the correct answer
    const correctBtn = options.find((btn) => btn.text() === '4');
    expect(correctBtn).toBeDefined();

    await correctBtn!.trigger('click');

    const result = wrapper.find('.result');
    expect(result.exists()).toBe(true);
    expect(result.classes()).toContain('correct');
    expect(result.text()).toContain('quiz.correct');
  });

  it('handles a wrong answer', async () => {
    stubFetch({
      response_code: 0,
      results: [
        {
          question: 'What is 2+2?',
          correct_answer: '4',
          incorrect_answers: ['1', '2', '3'],
        },
      ],
    });

    const wrapper = mount(Quiz);

    await vi.waitFor(() => {
      expect(wrapper.find('.question').exists()).toBe(true);
    });

    const options = wrapper.findAll('.options button');

    // Find a button with an incorrect answer
    const wrongBtn = options.find((btn) => btn.text() === '1');
    expect(wrongBtn).toBeDefined();

    await wrongBtn!.trigger('click');

    const result = wrapper.find('.result');
    expect(result.exists()).toBe(true);
    expect(result.classes()).toContain('wrong');
    expect(result.text()).toContain('quiz.wrong');
  });

  it('handles API errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const wrapper = mount(Quiz);

    await vi.waitFor(() => {
      expect(wrapper.find('.error').exists()).toBe(true);
    });

    expect(wrapper.find('.error').text()).toBe('Network error');
  });

  it('loads next question when button is clicked', async () => {
    const firstResponse = {
      response_code: 0,
      results: [
        {
          question: 'First Question?',
          correct_answer: 'Yes',
          incorrect_answers: ['No'],
        },
      ],
    };

    const secondResponse = {
      response_code: 0,
      results: [
        {
          question: 'Second Question?',
          correct_answer: 'Yes',
          incorrect_answers: ['No'],
        },
      ],
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(firstResponse),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(secondResponse),
      } as Response);

    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mount(Quiz);

    await vi.waitFor(() => {
      expect(wrapper.find('.question').exists()).toBe(true);
    });

    expect(wrapper.find('.question').text()).toBe('First Question?');

    // Answer the question
    await wrapper.findAll('.options button')[0].trigger('click');

    const nextBtn = wrapper.find('.result button');
    expect(nextBtn.exists()).toBe(true);

    await nextBtn.trigger('click');

    await vi.waitFor(() => {
      expect(wrapper.find('.question').text()).toBe('Second Question?');
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
