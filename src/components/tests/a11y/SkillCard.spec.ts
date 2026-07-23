import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { configureAxe } from 'vitest-axe';
import SkillCard from '../../SkillCard.vue';

const runAxe = configureAxe({
  rules: {
    region: { enabled: false },
  },
});

describe('SkillCard.vue a11y', () => {
  const skills = [
    { name: 'JavaScript', icon: '🟨' },
    { name: 'TypeScript', icon: '/ts-icon.svg', link: 'https://typescriptlang.org' },
  ];

  it('has no a11y violations', async () => {
    const wrapper = mount(SkillCard, { props: { skills } });
    const results = await runAxe(wrapper.element);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations with category', async () => {
    const wrapper = mount(SkillCard, {
      props: { skills, category: 'Languages' },
    });
    const results = await runAxe(wrapper.element);
    expect(results).toHaveNoViolations();
  });
});
