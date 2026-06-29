import { ref, watch, type Ref, type ComputedRef } from 'vue';
import type { Page } from '../interfaces/Page';

export function useScrollSpy(
  visiblePages: ComputedRef<Page[]>,
  headerRef: Ref<HTMLElement | null>
) {
  const activeSection = ref('home');
  const showHint = ref(true);
  const hintHasBeenShown = ref(false);

  let scrollSpyLocked = false;
  let scrollLockTimeout: ReturnType<typeof setTimeout>;
  let scrollRafId: number | null = null;

  watch(
    showHint,
    (val) => {
      if (val && !hintHasBeenShown.value) {
        hintHasBeenShown.value = true;
      }
    },
    { flush: 'post' }
  );

  function getSectionIdFromPage(page: Page): string {
    if (page.link === '/') return 'home';
    return page.link.replace(/^\//, '');
  }

  function getScrollOffset(): number {
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(min-width: 1024px) and (orientation: landscape)').matches
    ) {
      return 16;
    }
    if (!headerRef.value) {
      return 160 + 16;
    }
    return headerRef.value.offsetHeight + 24;
  }

  function lockScrollSpy(duration: number = 1200) {
    scrollSpyLocked = true;
    clearTimeout(scrollLockTimeout);
    scrollLockTimeout = setTimeout(() => {
      scrollSpyLocked = false;
      updateActiveSection();
    }, duration);
  }

  function updateActiveSection() {
    if (scrollSpyLocked) return;

    const sectionIds = visiblePages.value.map(getSectionIdFromPage);
    if (sectionIds.length === 0) return;

    const headerBottom = getScrollOffset();
    let currentActive = sectionIds[0];
    let maxVisibleHeight = 0;

    for (let i = 0; i < sectionIds.length; i++) {
      const id = sectionIds[i];
      const el = document.getElementById(id);
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      const visibleTop = Math.max(rect.top, headerBottom);
      const visibleBottom = Math.min(rect.bottom, window.innerHeight);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        currentActive = sectionIds[i];
      }
    }

    if (currentActive !== activeSection.value) {
      activeSection.value = currentActive;
    }
  }

  function getScrollToPosition(element: HTMLElement): number {
    const scrollOffset = getScrollOffset();
    const elementPosition = element.getBoundingClientRect().top;
    return elementPosition + window.pageYOffset - scrollOffset;
  }

  function scrollToElement(element: HTMLElement, behavior: ScrollBehavior = 'smooth') {
    window.scrollTo({ top: getScrollToPosition(element), behavior });
  }

  function scrollToSection(sectionId: string, behavior: ScrollBehavior = 'smooth') {
    const element = document.getElementById(sectionId);
    if (element) {
      scrollToElement(element, behavior);
      history.pushState(null, '', `#${sectionId}`);
      activeSection.value = sectionId;
      lockScrollSpy(1200);
    }
  }

  function navigatePage(direction: 'next' | 'prev') {
    const sectionIds = visiblePages.value.map(getSectionIdFromPage);
    const currentIndex = sectionIds.indexOf(activeSection.value);
    let nextIndex = currentIndex;

    if (direction === 'next' && currentIndex < sectionIds.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    if (nextIndex !== currentIndex) {
      scrollToSection(sectionIds[nextIndex]);
    }
  }

  function handleScroll() {
    if (scrollRafId === null) {
      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;
        updateActiveSection();
      });
    }
  }

  function handleInitialHash() {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          scrollToElement(el, 'auto');
        }
      }, 100);
    }
  }

  function scrollToHash(hash: string) {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      activeSection.value = 'home';
      lockScrollSpy(1200);
      return;
    }
    const sectionId = hash.replace(/^#/, '');
    const el = document.getElementById(sectionId);
    if (el) {
      scrollToElement(el, 'auto');
      activeSection.value = sectionId;
      lockScrollSpy(1200);
    }
  }

  function cleanup() {
    if (scrollRafId !== null) {
      cancelAnimationFrame(scrollRafId);
    }
    clearTimeout(scrollLockTimeout);
  }

  return {
    activeSection,
    hintHasBeenShown,
    handleScroll,
    scrollToSection,
    navigatePage,
    scrollToHash,
    handleInitialHash,
    updateActiveSection,
    getSectionIdFromPage,
    cleanup,
  };
}
