import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('../../configs/pages.json', () => ({
  default: [
    {
      name: 'Home',
      link: '/',
      title: 'Home Page',
      body: ['Welcome paragraph.'],
      icon: '🏠',
      accent: '#00ffcc',
      sections: [
        {
          type: 'cards',
          heading: 'What I Do',
          columns: 3,
          items: [
            { icon: '🌐', title: 'Full-Stack Dev', description: 'Build things.' },
            { icon: '🎨', title: 'Creative UI', description: 'Design things.' },
            { icon: '⚡', title: 'Interactive 3D', description: 'Render things.' },
          ],
        },
      ],
    },
    {
      name: 'About',
      link: '/about',
      title: 'About Me',
      body: ['About paragraph.'],
      accent: '#bb66ff',
      sections: [
        {
          type: 'skills',
          heading: 'Technical Skills',
          groups: [
            {
              category: 'Backend',
              skills: [{ name: 'PHP', icon: '🐘' }],
            },
          ],
        },
      ],
    },
    {
      name: 'Interests',
      link: '/interests',
      title: 'Interests',
      body: ['Interests content.'],
      accent: '#ff44dd',
      sections: [
        {
          type: 'musicCard',
          heading: 'Music & Creative',
          icon: '🎸',
          title: 'Guitar',
          description: 'Original music',
          linkUrl: 'https://youtube.com',
          linkText: 'Visit →',
        },
        {
          type: 'interestGrid',
          items: [
            { icon: '🕹️', text: '3D Graphics' },
            { icon: '🧪', text: 'Experiments' },
          ],
        },
      ],
    },
    { name: 'Hidden', link: '/hidden', title: 'Hidden', body: ['Hidden content.'], hidden: true },
  ],
}));

vi.mock('../../configs/titles.json', () => ({
  default: { title: 'Test', subtitle: 'Sub' },
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ path: '/' })),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

import SinglePageContent from '../SinglePageContent.vue';

function getStubs() {
  return {
    Paragraph: { template: '<div><slot /></div>' },
    SkillCard: {
      template: "<div class='skill-card-stub'><slot /></div>",
      props: ['skills', 'category'],
    },
    SectionDivider: { template: "<div class='divider-stub'><slot /></div>" },
  };
}

describe('SinglePageContent.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all non-hidden pages', () => {
    const wrapper = mount(SinglePageContent, {
      global: { stubs: getStubs() },
    });
    expect(wrapper.text()).toContain('Home Page');
    expect(wrapper.text()).toContain('About Me');
    expect(wrapper.text()).not.toContain('Hidden');
  });

  it('renders section ids based on page links', () => {
    const wrapper = mount(SinglePageContent, {
      global: { stubs: getStubs() },
    });
    expect(wrapper.find('#home').exists()).toBe(true);
    expect(wrapper.find('#about').exists()).toBe(true);
    expect(wrapper.find('#hidden').exists()).toBe(false);
  });

  it('renders cards section from config', () => {
    const wrapper = mount(SinglePageContent, {
      global: { stubs: getStubs() },
    });
    expect(wrapper.text()).toContain('What I Do');
    expect(wrapper.text()).toContain('Full-Stack Dev');
    expect(wrapper.text()).toContain('Creative UI');
  });

  it('renders skills section from config', () => {
    const wrapper = mount(SinglePageContent, {
      global: { stubs: getStubs() },
    });
    const skills = wrapper.findAll('.skill-card-stub');
    expect(skills.length).toBe(1);
  });

  it('renders music card and interest grid from config', () => {
    const wrapper = mount(SinglePageContent, {
      global: { stubs: getStubs() },
    });
    expect(wrapper.text()).toContain('Music & Creative');
    expect(wrapper.text()).toContain('Visit →');
    expect(wrapper.text()).toContain('3D Graphics');
    expect(wrapper.text()).toContain('Experiments');
  });
});
