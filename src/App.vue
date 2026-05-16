<template>
  <div id="content-wrapper" :class="{ 'fade-out': gameMode }">
    <header ref="headerRef" class="app-header">
      <nav class="container header-nav">
        <Title
          :title="titles.title"
          :subtitle="titles.subtitle"
          :activity="activity"
          :joke="joke"
          @activity="toggleActivity"
          @joke="toggleJoke"
        />
        <Menu
          :pages="visiblePages"
          :content-visible="isContentVisible"
          :city-fallback="cityFallback"
          @explore="startExploration"
          @fly="startFlyingTour"
          @demo="startDemoMode"
          @toggle-content="toggleContent"
        />
      </nav>
    </header>

    <main class="app-main">
      <div class="container">
        <Transition name="cyberpunk-glitch">
          <div
            class="router-view-container"
            ref="containerRef"
            v-show="isContentVisible"
          >
            <router-view v-slot="{ Component, route }">
              <ErrorBoundary>
                <component :is="Component" :key="route.path" />
              </ErrorBoundary>
            </router-view>
          </div>
        </Transition>
      </div>
    </main>

    <Transition name="fade">
      <footer
        class="app-footer"
        v-if="noFootersShowing && showHint"
        v-show="isContentVisible"
        @click="checker = !checker"
      >
        <div class="container">
          <TypingText text="The titles might be clickable..." />
        </div>
      </footer>
    </Transition>

    <Transition name="fade">
      <Checker v-if="checker" :class="{ 'fade-out': gameMode }" />
    </Transition>
    <Transition name="fade">
      <Activity v-show="activity" :class="{ 'fade-out': gameMode }" />
    </Transition>
    <Transition name="fade">
      <Suggestion
        v-show="joke"
        :class="{ 'fade-out': gameMode }"
        url="https://icanhazdadjoke.com/"
        valueName="joke"
        title="Have a laugh!"
      />
    </Transition>
  </div>

  <CyberpunkCity
    v-if="showCity"
    ref="cyberpunkCityRef"
    @game-start="gameMode = true"
    @game-end="gameMode = false"
    @fallback="cityFallback = true"
  />
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  computed,
  watch,
  defineAsyncComponent,
  onErrorCaptured,
  provide,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import Title from "./components/Title.vue";
import Menu from "./components/Menu.vue";
import Checker from "./components/Checker.vue";
import Activity from "./components/Activity.vue";
import Suggestion from "./components/Suggestion.vue";
import TypingText from "./components/TypingText.vue";
import ErrorBoundary from "./components/ErrorBoundary.vue";
import pages from "./configs/pages.json";

const CyberpunkCity = defineAsyncComponent(() => {
  if (import.meta.env.SSR) {
    return Promise.resolve({ render: () => null });
  }
  return import("./components/CyberpunkCity.vue");
});
import { cityBackground } from "./utils/CityBackgroundManager";
import titles from "./configs/titles.json";
import { Page } from "./interfaces/Page";

const visiblePages = computed(() => {
  return pages.filter((page: Page) => !page.hidden);
});

const containerRef = ref<HTMLElement | null>(null);
const checker = ref(false);
const activity = ref(false);
const joke = ref(false);
const showHint = ref(false);
const route = useRoute();
const router = useRouter();
const gameMode = ref(false);
const cityFallback = ref(false);
const isContentVisible = ref(true);
const isClient = ref(false);
const showCity = computed(() => isClient.value && cityBackground.isEnabled.value);
const activeSection = ref("home");
let scrollSpyLocked = false;
let scrollLockTimeout: ReturnType<typeof setTimeout>;
const headerRef = ref<HTMLElement | null>(null);

function getHeaderHeight(): number {
  if (!headerRef.value) {
    return 160;
  }
  return headerRef.value.offsetHeight + 8;
}

function getScrollOffset(): number {
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

function scrollToSection(sectionId: string, behavior: ScrollBehavior = "smooth") {
  const element = document.getElementById(sectionId);
  if (element) {
    const scrollOffset = getScrollOffset();
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - scrollOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: behavior,
    });
    history.pushState(null, "", `#${sectionId}`);
    activeSection.value = sectionId;
    lockScrollSpy(1200);
  }
}

provide("activeSection", activeSection);
provide("navigateToSection", scrollToSection);

function toggleContent() {
  isContentVisible.value = !isContentVisible.value;
}

const cyberpunkCityRef = ref<InstanceType<typeof import("./components/CyberpunkCity.vue").default> | null>(null);

function startExploration() {
  if (cyberpunkCityRef.value && cyberpunkCityRef.value.startExplorationMode) {
    cyberpunkCityRef.value.startExplorationMode();
  }
}

function startFlyingTour() {
  if (cyberpunkCityRef.value && cyberpunkCityRef.value.startFlyingTour) {
    cyberpunkCityRef.value.startFlyingTour();
  }
}

function startDemoMode() {
  if (cyberpunkCityRef.value && cyberpunkCityRef.value.startDemoMode) {
    cyberpunkCityRef.value.startDemoMode();
  }
}

function navigatePage(direction: "next" | "prev") {
  const sectionIds = visiblePages.value.map((p: Page) =>
    p.link === "/" ? "home" : p.link.replace(/^\//, "")
  );
  const currentIndex = sectionIds.indexOf(activeSection.value);
  let nextIndex = currentIndex;

  if (direction === "next" && currentIndex < sectionIds.length - 1) {
    nextIndex = currentIndex + 1;
  } else if (direction === "prev" && currentIndex > 0) {
    nextIndex = currentIndex - 1;
  }

  if (nextIndex !== currentIndex) {
    scrollToSection(sectionIds[nextIndex]);
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
    navigatePage(deltaX < 0 ? "next" : "prev");
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (gameMode.value) return;

  if (e.key === "Escape") {
    const gameRoutes = ["/noughts-and-crosses", "/checker", "/ask"];
    if (gameRoutes.includes(route.path)) {
      router.push("/");
    }
  }

  if (route.path === "/" || route.path === "") {
    switch (e.key) {
      case "ArrowRight":
        navigatePage("next");
        break;
      case "ArrowLeft":
        navigatePage("prev");
        break;
    }
  }
}

const noFootersShowing = computed(() => {
  return !activity.value && !checker.value && !joke.value;
});

function toggleActivity() {
  activity.value = !activity.value;
}

function toggleJoke() {
  joke.value = !joke.value;
}

function getSectionIdFromPage(page: Page): string {
  if (page.link === "/") return "home";
  return page.link.replace(/^\//, "");
}

function updateActiveSection() {
  if (scrollSpyLocked) return;

  const sectionIds = visiblePages.value.map(getSectionIdFromPage);
  if (sectionIds.length === 0) return;

  const activeLine = getScrollOffset();
  let currentActive = sectionIds[0];
  let lastCrossedIndex = 0;
  let closestIndex = 0;
  let closestDistance = Infinity;

  for (let i = 0; i < sectionIds.length; i++) {
    const id = sectionIds[i];
    const el = document.getElementById(id);
    if (!el) continue;

    const rect = el.getBoundingClientRect();

    const distance = Math.abs(rect.top - activeLine);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = i;
    }

    if (rect.top <= activeLine + 8) {
      lastCrossedIndex = i;
    }
  }

  if (closestDistance <= 20) {
    currentActive = sectionIds[closestIndex];
  } else {
    currentActive = sectionIds[lastCrossedIndex];
  }

  if (currentActive !== activeSection.value) {
    activeSection.value = currentActive;
  }
}

function handleInitialHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash) {
    setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) {
        const scrollOffset = getScrollOffset();
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - scrollOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "auto",
        });
      }
    }, 100);
  }
}

let scrollTimeout: ReturnType<typeof setTimeout>;

function handleScroll() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(updateActiveSection, 50);
}

onMounted(() => {
  isClient.value = true;

  setTimeout(() => {
    showHint.value = true;
  }, 2000);

  setTimeout(() => {
    showHint.value = false;
  }, 5000);

  let lastTouchTime = 0;

  document.body.addEventListener("touchstart", () => {
    lastTouchTime = Date.now();
    document.body.classList.remove("can-hover");
  });

  document.body.addEventListener("mousemove", () => {
    if (Date.now() - lastTouchTime > 500) {
      document.body.classList.add("can-hover");
    }
  });

  window.addEventListener("keydown", handleKeydown);

  const contentEl = document.getElementById("content-wrapper");
  if (contentEl) {
    contentEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    contentEl.addEventListener("touchend", handleTouchEnd, { passive: true });
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleInitialHash();
  updateActiveSection();
});

onErrorCaptured((err) => {
  console.error("App Error Captured:", err);
  return true;
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("scroll", handleScroll);
  const contentEl = document.getElementById("content-wrapper");
  if (contentEl) {
    contentEl.removeEventListener("touchstart", handleTouchStart);
    contentEl.removeEventListener("touchend", handleTouchEnd);
  }
  clearTimeout(scrollTimeout);
  clearTimeout(scrollLockTimeout);
});

function getTitleForPath(path: string): string {
  switch (path) {
    case "/noughts-and-crosses":
      return "Noughts and Crosses";
    case "/checker":
      return "Checker";
    case "/ask":
      return "Ask Me";
    default:
      const page = visiblePages.value.find(
        (p: Page) => getSectionIdFromPage(p) === activeSection.value
      );
      return page ? page.title : "Elliot Dickerson";
  }
}

watch(
  () => route.path,
  (newPath) => {
    const pageTitle = getTitleForPath(newPath);
    if (typeof document !== "undefined") {
      document.title = "Elliot > " + pageTitle;
    }
  },
  { immediate: true },
);

watch(activeSection, (newSection) => {
  const pageTitle = getTitleForPath(route.path);
  if (typeof document !== "undefined") {
    document.title = "Elliot > " + pageTitle;
  }
}, { immediate: true });

watch(showCity, (val) => {
  if (val) {
    cityFallback.value = false;
  }
});
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
  backdrop-filter: blur(12px);
  background: rgba(5, 5, 16, 0.8);
  border-bottom: 1px solid rgba(0, 255, 204, 0.15);
  transform: translateZ(0);
  will-change: transform;
}

.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.app-main {
  padding: 2rem 0;
}

.app-footer {
  padding: 1.5rem 0;
  text-align: center;
  border-top: 1px solid rgba(0, 255, 204, 0.1);
  opacity: 0.6;
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

html {
  scroll-behavior: smooth;
  scroll-padding-top: 100px;
}

@media (max-width: 768px) {
  html {
    scroll-padding-top: 200px;
  }
}
</style>
