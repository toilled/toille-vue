import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../../App.vue';
import { createRouter, createMemoryHistory } from 'vue-router';

const createTestRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: 'Home' } },
      { path: '/:name', component: { template: 'Page' } },
      { path: '/:pathMatch(.*)*', component: { template: 'NotFound' } },
    ],
  });
};

vi.mock('../../configs/pages.json', () => ({
  default: [
    { name: 'Home', link: '/', title: 'Home' },
    { name: 'About', link: '/about', title: 'About Me' },
  ],
}));

vi.mock('../../configs/titles.json', () => ({
  default: {
    title: 'Main Title',
    subtitle: 'Main Subtitle',
  },
}));

async function mountApp(stubs: Record<string, unknown> = {}) {
  const router = createTestRouter();
  router.push('/');
  await router.isReady();
  const app = mount(App, {
    global: {
      plugins: [router],
      stubs: { Starfield: true, ...stubs },
    },
  });
  await new Promise((resolve) => setTimeout(resolve));
  return app;
}

async function scrollToBottom(_el: unknown) {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 2000,
    configurable: true,
  });
  window.innerHeight = 800;
  window.scrollY = 1200;
  window.dispatchEvent(new Event('scroll'));
  await new Promise((r) => setTimeout(r, 30));
}

describe('App.vue', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;

  beforeEach(() => {
    const mockWeatherData = {
      current_weather: {
        weathercode: 0,
        temperature: 10,
      },
      hourly: {
        time: [
          '2023-10-27T00:00',
          '2023-10-27T01:00',
          '2023-10-27T02:00',
          '2023-10-27T03:00',
          '2023-10-27T04:00',
          '2023-10-27T05:00',
        ],
        temperature_2m: [10, 11, 12, 13, 14, 15],
        rain: [0, 0, 0, 0, 0, 0],
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWeatherData),
      headers: {
        get: vi.fn(),
      },
    });

    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.unstubAllGlobals();
  });

  it('renders the main components', async () => {
    wrapper = await mountApp({ 'router-view': true });
    expect(wrapper.findComponent({ name: 'Title' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'Menu' }).exists()).toBe(true);
    expect(wrapper.find('router-view-stub').exists()).toBe(true);
  });

  it('toggles the Activity component', async () => {
    wrapper = await mountApp();
    const title = wrapper.findComponent({ name: 'Title' });
    await title.vm.$emit('activity');
    await new Promise((resolve) => setTimeout(resolve));
    expect(wrapper.vm.activity).toBe(true);
    await title.vm.$emit('activity');
    await new Promise((resolve) => setTimeout(resolve));
    expect(wrapper.vm.activity).toBe(false);
  });

  it('toggles the Suggestion component', async () => {
    wrapper = await mountApp();
    const title = wrapper.findComponent({ name: 'Title' });
    await title.vm.$emit('joke');
    await new Promise((resolve) => setTimeout(resolve));
    expect(wrapper.vm.joke).toBe(true);
    await title.vm.$emit('joke');
    await new Promise((resolve) => setTimeout(resolve));
    expect(wrapper.vm.joke).toBe(false);
  });

  it('toggles the Checker component', async () => {
    wrapper = await mountApp();

    await scrollToBottom(wrapper);

    const footer = wrapper.find('footer');
    await footer.trigger('click');
    await new Promise((resolve) => setTimeout(resolve));
    expect(wrapper.vm.checker).toBe(true);
  });

  it('shows the hint always', async () => {
    wrapper = await mountApp({ TypingText: true });
    expect(wrapper.findComponent({ name: 'TypingText' }).exists()).toBe(true);
  });

  it('updates the document title on route change', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: 'Home' } },
        { path: '/about', component: { template: 'About' } },
        { path: '/checker', component: { template: 'Checker' } },
        { path: '/ask', component: { template: 'Ask' } },
        { path: '/:pathMatch(.*)*', component: { template: 'NotFound' } },
      ],
    });
    router.push('/');
    await router.isReady();
    wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          'router-view': true,
          Starfield: true,
        },
      },
    });
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.title).toBe('Home | Elliot Dickerson');

    await router.push('/checker');
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.title).toBe('app.titleChecker | Elliot Dickerson');

    await router.push('/ask');
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.title).toBe('app.titleAsk | Elliot Dickerson');

    await router.push('/about');
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.title).toBe('Home | Elliot Dickerson');
  });
});
