<template>
  <div id="content-wrapper" :class="{ 'fade-out': gameMode }" v-show="!desktopMode">
    <AppHeader
      :visible-pages="visiblePages"
      :content-visible="isContentVisible"
      :city-fallback="cityFallback"
      @activity="toggleActivity"
      @joke="toggleJoke"
      @explore="startExploration"
      @demo="startDemoMode"
      @toggle-content="toggleContent"
      @toggle-terminal="toggleTerminal"
      @toggle-desktop="toggleDesktop"
    />

    <main
      id="main-content"
      tabindex="-1"
      class="app-main"
      :class="{ 'content-collapsed': !isContentVisible }"
    >
      <div class="container">
        <div class="title-above-main">
          <Title
            :title="titles.title"
            :subtitle="t('site.subtitle')"
            @activity="toggleActivity"
            @joke="toggleJoke"
          />
        </div>
        <Transition name="cyberpunk-glitch">
          <div class="router-view-container" v-show="isContentVisible">
            <router-view v-slot="{ Component, route }">
              <ErrorBoundary>
                <component :is="Component" :key="route.path" />
              </ErrorBoundary>
            </router-view>
          </div>
        </Transition>
      </div>
    </main>

    <AppFooter
      :no-footers-showing="noFootersShowing"
      :content-visible="isContentVisible"
      :hint-has-been-shown="hintHasBeenShown"
      @toggle-checker="toggleChecker"
    />

    <AppOverlays :checker="checker" :activity="activity" :joke="joke" :game-mode="gameMode" />
  </div>

  <div id="ambient-bg" aria-hidden="true"></div>
  <div class="ambient-glow" aria-hidden="true"></div>

  <Transition name="fade">
    <Terminal v-if="terminal" @close="toggleTerminal" />
  </Transition>

  <CyberpunkCity
    v-if="showCity"
    ref="cyberpunkCityRef"
    @game-start="startGame"
    @game-end="endGame"
    @fallback="handleCityFallback"
    @navigate="handleNavigate"
  />
  <EpilepsyWarning />
  <Desktop v-if="desktopMode" @shutdown="toggleDesktop" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useTranslatedPages } from './composables/useTranslatedPages';
import type { Component } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import AppOverlays from './components/AppOverlays.vue';
import { useGameState } from './composables/useGameState';
import { useDesktopMode } from './composables/useDesktopMode';
import { useUIStore } from './stores/uiStore';

const { t, locale } = useI18n();
const { translatedPages } = useTranslatedPages();
const { gameMode, cityFallback, showCity, setClient, startGame, endGame, handleCityFallback } =
  useGameState();
const { desktopMode, terminal, toggleDesktop, toggleTerminal } = useDesktopMode();
const uiStore = useUIStore();

const CyberpunkCity = defineAsyncComponent(() => {
  if (import.meta.env.SSR) {
    return Promise.resolve({ render: () => null } as Component);
  }
  return import('./components/CyberpunkCity.vue').then((m) => m.default);
});
import titles from './configs/titles.json';
import { Page } from './interfaces/Page';
const Terminal = defineAsyncComponent(() => import('./components/Terminal.vue'));
const Desktop = defineAsyncComponent(() => import('./components/Desktop.vue'));
import EpilepsyWarning from './components/EpilepsyWarning.vue';
import { useScrollSpy } from './composables/useScrollSpy';

const visiblePages = computed(() => {
  return translatedPages.value.filter((page: Page) => !page.hidden);
});

const route = useRoute();
const router = useRouter();
const isContentVisible = computed(() => uiStore.isContentVisible);
const checker = computed(() => uiStore.checker);
const activity = computed(() => uiStore.activity);
const joke = computed(() => uiStore.joke);

const headerRef = ref<HTMLElement | null>(null);

const {
  activeSection,
  hintHasBeenShown,
  handleScroll,
  scrollToSection,
  navigatePage,
  scrollToHash,
  handleInitialHash,
  updateActiveSection,
  getSectionIdFromPage,
  cleanup: cleanupScrollSpy,
} = useScrollSpy(visiblePages, headerRef);

provide('activeSection', activeSection);

function toggleContent() {
  uiStore.toggleContent();
}

function toggleChecker() {
  uiStore.toggleChecker();
}

const cyberpunkCityRef = ref<InstanceType<
  typeof import('./components/CyberpunkCity.vue').default
> | null>(null);

function startExploration() {
  if (cyberpunkCityRef.value && cyberpunkCityRef.value.startExplorationMode) {
    cyberpunkCityRef.value.startExplorationMode();
  }
}

function startDemoMode() {
  if (cyberpunkCityRef.value && cyberpunkCityRef.value.startDemoMode) {
    cyberpunkCityRef.value.startDemoMode();
  }
}

function handleNavigate(path: string) {
  if (gameMode.value) return;
  uiStore.isContentVisible = true;
  if (path === '/') {
    router.push('/');
    return;
  }
  if (route.path === '/') {
    const section = path.replace(/^\//, '');
    scrollToSection(section);
  } else {
    router.push(path);
  }
}

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e: TouchEvent) {
  if (gameMode.value) return;
  const deltaX = e.changedTouches[0].clientX - touchStartX;
  const deltaY = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
    navigatePage(deltaX < 0 ? 'next' : 'prev');
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (gameMode.value) return;

  if (e.key === 'Escape') {
    const gameRoutes = ['/noughts-and-crosses', '/checker'];
    if (gameRoutes.includes(route.path)) {
      router.push('/');
    }
  }

  if (route.path === '/' || route.path === '') {
    switch (e.key) {
      case 'ArrowRight':
        navigatePage('next');
        break;
      case 'ArrowLeft':
        navigatePage('prev');
        break;
    }
  }
}

const noFootersShowing = computed(() => uiStore.noFootersShowing);

function toggleActivity() {
  uiStore.toggleActivity();
}

function toggleJoke() {
  uiStore.toggleJoke();
}

onMounted(() => {
  setClient(true);

  history.scrollRestoration = 'manual';

  let lastTouchTime = 0;

  document.body.addEventListener('touchstart', () => {
    lastTouchTime = Date.now();
    document.body.classList.remove('can-hover');
  });

  document.body.addEventListener('mousemove', () => {
    if (Date.now() - lastTouchTime > 500) {
      document.body.classList.add('can-hover');
    }
  });

  window.addEventListener('keydown', handleKeydown);

  const contentEl = document.getElementById('content-wrapper');
  if (contentEl) {
    contentEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    contentEl.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleInitialHash();
  updateActiveSection();
});

watch(
  () => route.hash,
  (newHash) => {
    if (route.path !== '/') return;
    scrollToHash(newHash);
  }
);

onErrorCaptured((err) => {
  console.error('App Error Captured:', err);
  return true;
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('scroll', handleScroll);
  const contentEl = document.getElementById('content-wrapper');
  if (contentEl) {
    contentEl.removeEventListener('touchstart', handleTouchStart);
    contentEl.removeEventListener('touchend', handleTouchEnd);
  }
  cleanupScrollSpy();
});

function getTitleForPath(path: string): string {
  switch (path) {
    case '/noughts-and-crosses':
      return t('app.titleNoughtsAndCrosses');
    case '/checker':
      return t('app.titleChecker');
    default: {
      const page = visiblePages.value.find(
        (p: Page) => getSectionIdFromPage(p) === activeSection.value
      );
      return page ? page.title : t('site.title');
    }
  }
}

watch(
  () => route.path,
  (newPath) => {
    const pageTitle = getTitleForPath(newPath);
    if (typeof document !== 'undefined') {
      document.title = `${pageTitle} | Elliot Dickerson`;
    }
  },
  { immediate: true }
);

watch(
  activeSection,
  () => {
    const pageTitle = getTitleForPath(route.path);
    if (typeof document !== 'undefined') {
      document.title = `${pageTitle} | Elliot Dickerson`;
    }
  },
  { immediate: true }
);

watch(
  locale,
  (newLocale) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  },
  { immediate: true }
);
</script>

<style>
#content-wrapper {
  display: flex;
  flex-direction: column;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  background: rgba(5, 5, 16, 0.85);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  transform: translateZ(0);
  contain: paint layout;
}

html:not(.fx) .app-header {
  will-change: transform;
}

html.fx .app-header {
  backdrop-filter: blur(4px) saturate(1.1);
  -webkit-backdrop-filter: blur(4px) saturate(1.1);
}

.app-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 255, 204, 0.4),
    rgba(255, 0, 204, 0.4),
    transparent
  );
  animation: header-glow 3s ease-in-out infinite;
  will-change: opacity;
}

@keyframes header-glow {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding-top: 0.85rem;
  padding-bottom: 0.85rem;
}

.app-main {
  padding: 2rem 0;
  min-height: 60vh;
}

.app-main.content-collapsed {
  min-height: 0;
}

.app-footer {
  padding: 1.5rem 0;
  text-align: center;
  border-top: 1px solid rgba(0, 255, 204, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    opacity 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    max-height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    margin 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    padding 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  max-height: 300px;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.fade-out {
  opacity: 0;
  pointer-events: none;
  transition: opacity 2s ease;
}

.cyberpunk-glitch-enter-active {
  animation: glitch-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.cyberpunk-glitch-leave-active {
  animation: glitch-out 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes glitch-in {
  0% {
    opacity: 0;
    transform: scaleY(0.1) skewX(20deg);
    filter: hue-rotate(90deg);
    clip-path: inset(50% 0 50% 0);
  }
  20% {
    opacity: 1;
    transform: scaleY(0.4) skewX(-10deg);
    clip-path: inset(20% 0 30% 0);
  }
  60% {
    transform: scaleY(1.1) skewX(5deg);
    clip-path: inset(0 0 0 0);
  }
  100% {
    opacity: 1;
    transform: scaleY(1) skewX(0);
    filter: hue-rotate(0deg);
  }
}

@keyframes glitch-out {
  0% {
    opacity: 1;
    transform: scaleY(1) skewX(0);
    clip-path: inset(0 0 0 0);
  }
  40% {
    transform: scaleY(1.1) skewX(-5deg);
    clip-path: inset(10% 0 10% 0);
  }
  80% {
    opacity: 0.5;
    transform: scaleY(0.2) skewX(40deg);
    clip-path: inset(40% 0 40% 0);
  }
  100% {
    opacity: 0;
    transform: scaleY(0.1) skewX(60deg);
    clip-path: inset(50% 0 50% 0);
  }
}

@media (max-width: 768px) {
  .app-main {
    padding: 1rem 0;
  }
  .header-nav {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
}

#main-content:focus-visible {
  outline: 2px solid #00ffcc;
  outline-offset: -2px;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
}

@media (max-width: 768px) {
  html {
    scroll-padding-top: 180px;
  }
}

.title-above-main {
  display: none;
}

@media (min-width: 1024px) and (orientation: landscape) and (hover: hover) and (pointer: fine) {
  #content-wrapper {
    margin-left: 220px;
  }

  .app-header {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 220px;
    height: 100vh;
    overflow-y: auto;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
  }

  .app-header::after {
    top: 0;
    bottom: 0;
    left: auto;
    right: 0;
    width: 1px;
    height: auto;
    background: linear-gradient(
      180deg,
      transparent,
      rgba(0, 255, 204, 0.4),
      rgba(255, 0, 204, 0.4),
      transparent
    );
  }

  .app-header .site-title {
    display: none;
  }

  .header-nav {
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    padding: 1rem 1.5rem;
    height: 100%;
    box-sizing: border-box;
  }

  .app-main {
    padding: 2rem;
    min-height: 100vh;
  }

  .app-main.content-collapsed {
    min-height: 0;
  }

  .title-above-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(0, 255, 204, 0.15);
  }

  .title-above-main h1.title {
    font-size: 3.5rem;
  }

  .title-above-main .site-title {
    align-items: center;
  }

  .title-above-main h2.subtitle {
    font-size: 1.35rem;
  }

  html {
    scroll-padding-top: 0;
  }
}
</style>
