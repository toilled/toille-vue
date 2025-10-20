
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import TypingText from '../TypingText.vue'
import flushPromises from 'flush-promises'

describe('TypingText.vue', () => {
  it('should display text character by character', async () => {
    vi.useFakeTimers()
    const text = 'Hello, world!'
    const wrapper = mount(TypingText, {
      props: {
        text,
      },
    })

    expect(wrapper.text()).toBe('')

    await vi.advanceTimersByTimeAsync(100 * (text.length + 1))
    await flushPromises()

    expect(wrapper.text()).toBe(text)
    vi.useRealTimers()
  })
})
