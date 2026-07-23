import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { axe } from 'vitest-axe';
import Checker from '../../Checker.vue';

describe('Checker.vue a11y', () => {
  it('has no a11y violations', async () => {
    const wrapper = mount(Checker);
    const results = await axe(wrapper.element);
    expect(results).toHaveNoViolations();
  }, 30000);
});
