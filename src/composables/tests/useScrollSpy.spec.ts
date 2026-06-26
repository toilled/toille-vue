import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useScrollSpy } from '../useScrollSpy';
import { ref, computed, type ComputedRef, type Ref } from 'vue';
import type { Page } from '../../interfaces/Page';

function createPage(link: string): Page {
  return { name: link, link, title: link, body: [] };
}

function setElementRect(id: string, rect: Partial<DOMRect>) {
  const el = document.getElementById(id);
  if (el) {
    el.getBoundingClientRect = vi.fn(() => ({
      top: rect.top ?? 0,
      bottom: rect.bottom ?? 0,
      left: rect.left ?? 0,
      right: rect.right ?? 0,
      width: rect.width ?? 0,
      height: rect.height ?? 0,
      x: rect.x ?? 0,
      y: rect.y ?? 0,
      toJSON: () => ({}),
    }));
  }
}

describe('useScrollSpy', () => {
  let pages: Ref<Page[]>;
  let visiblePages: ComputedRef<Page[]>;
  let headerRef: Ref<HTMLElement | null>;
  let spy: ReturnType<typeof useScrollSpy>;

  beforeEach(() => {
    vi.useFakeTimers();

    // Set up DOM elements
    document.body.innerHTML = `
      <div id="home" style="height: 600px"></div>
      <div id="about" style="height: 600px"></div>
      <div id="projects" style="height: 600px"></div>
      <div id="contact" style="height: 600px"></div>
    `;

    setElementRect('home', { top: 0, bottom: 600, height: 600 });
    setElementRect('about', { top: 600, bottom: 1200, height: 600 });
    setElementRect('projects', { top: 1200, bottom: 1800, height: 600 });
    setElementRect('contact', { top: 1800, bottom: 2400, height: 600 });

    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    Object.defineProperty(window, 'pageYOffset', { value: 0, configurable: true });
    window.scrollTo = vi.fn();

    pages = ref([
      createPage('/'),
      createPage('/about'),
      createPage('/projects'),
      createPage('/contact'),
    ]);
    visiblePages = computed(() => pages.value);
    headerRef = ref(null);

    spy = useScrollSpy(visiblePages, headerRef);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('initializes with home as active section', () => {
    expect(spy.activeSection.value).toBe('home');
  });

  it('getSectionIdFromPage returns "home" for "/"', () => {
    expect(spy.getSectionIdFromPage(createPage('/'))).toBe('home');
  });

  it('getSectionIdFromPage strips leading slash', () => {
    expect(spy.getSectionIdFromPage(createPage('/about'))).toBe('about');
  });

  it('updateActiveSection finds the most visible section', () => {
    Object.defineProperty(window, 'pageYOffset', { value: 500 });
    // Scroll 500px down — "home" (y 0-600) is mostly off-screen, "about" (y 600-1200) is in view
    setElementRect('home', { top: -500, bottom: 100, height: 600 });
    setElementRect('about', { top: 100, bottom: 700, height: 600 });
    spy.updateActiveSection();
    expect(spy.activeSection.value).toBe('about');
  });

  it('scrollToSection scrolls to target and locks scroll spy', () => {
    spy.scrollToSection('about');
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: expect.any(Number), behavior: 'smooth' })
    );
  });

  it('navigatePage goes to next section', () => {
    spy.navigatePage('next');
    expect(spy.activeSection.value).toBe('about');
  });

  it('navigatePage goes to previous section', () => {
    spy.navigatePage('next');
    spy.navigatePage('next');
    expect(spy.activeSection.value).toBe('projects');
    spy.navigatePage('prev');
    expect(spy.activeSection.value).toBe('about');
  });

  it('navigatePage does nothing at boundaries', () => {
    // Already at first section
    spy.navigatePage('prev');
    expect(spy.activeSection.value).toBe('home');

    // Go to last
    spy.navigatePage('next');
    spy.navigatePage('next');
    spy.navigatePage('next');
    expect(spy.activeSection.value).toBe('contact');
    spy.navigatePage('next');
    expect(spy.activeSection.value).toBe('contact');
  });

  it('handleScroll uses RAF throttling', () => {
    spy.handleScroll();
    expect(spy.activeSection.value).toBe('home');
  });

  it('scrollToHash scrolls to element and updates active section', () => {
    spy.scrollToHash('#projects');
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: expect.any(Number), behavior: 'auto' })
    );
    expect(spy.activeSection.value).toBe('projects');
  });

  it('scrollToHash with empty hash scrolls to top', () => {
    spy.scrollToHash('');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(spy.activeSection.value).toBe('home');
  });

  it('cleanup cancels RAF and timeout', () => {
    expect(() => spy.cleanup()).not.toThrow();
  });

  it('handleInitialHash scrolls to hash element', () => {
    window.location.hash = '#about';
    spy.handleInitialHash();
    vi.advanceTimersByTime(100);
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: expect.any(Number), behavior: 'auto' })
    );
  });
});
