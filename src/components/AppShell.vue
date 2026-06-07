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
          @demo="startDemoMode"
          @toggle-content="toggleContent"
          @toggle-terminal="toggleTerminal"
        />
      </nav>
    </header>

    <Transition name="slide-fade">
      <footer
        class="app-footer"
        v-if="noFootersShowing && showHint"
        v-show="isContentVisible"
        @click="checker = !checker"
      >
        <div class="container">
          <TypingText text="The titles might be clickable..." :skip-animation="hintHasBeenShown" />
        </div>
      </footer>
    </Transition>

    <Transition name="slide-fade">
      <div class="container" style="min-width:0" v-if="checker">
        <Checker :class="{ 'fade-out': gameMode }" />
      </div>
    </Transition>
    <Transition name="slide-fade">
      <div class="container" style="min-width:0" v-show="activity">
        <Activity :class="{ 'fade-out': gameMode }" />
      </div>
    </Transition>
    <Transition name="slide-fade">
      <div class="container" style="min-width:0" v-show="joke">
        <Suggestion
          :class="{ 'fade-out': gameMode }"
          url="https://icanhazdadjoke.com/"
          valueName="joke"
          title="Have a laugh!"
        />
      </div>
    </Transition>
    <Transition name="fade">
      <Terminal v-if="terminal" @close="terminal = false" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import Title from "./Title.vue";
import Menu from "./Menu.vue";
import TypingText from "./TypingText.vue";
import Checker from "./Checker.vue";
import Activity from "./Activity.vue";
import Suggestion from "./Suggestion.vue";
import Terminal from "./Terminal.vue";
import pages from "../configs/pages.json";
import titles from "../configs/titles.json";
import { cityBackground } from "../utils/CityBackgroundManager";
import type { Page } from "../interfaces/Page";

const visiblePages = computed(() => {
  return pages.filter((page: Page) => !page.hidden);
});

const checker = ref(false);
const activity = ref(false);
const joke = ref(false);
const terminal = ref(false);
const showHint = ref(false);
const hintHasBeenShown = ref(false);

watch(showHint, (val) => {
  if (val && !hintHasBeenShown.value) {
    hintHasBeenShown.value = true;
  }
}, { flush: 'post' });

const gameMode = ref(false);
const cityFallback = ref(false);
const isContentVisible = ref(true);
const activeSection = ref("home");
let scrollSpyLocked = false;
let scrollLockTimeout: ReturnType<typeof setTimeout>;
let scrollRafId: number | null = null;
const headerRef = ref<HTMLElement | null>(null);

function getScrollOffset(): number {
  if (!headerRef.value) {
    return 160 + 16;
  }
  return headerRef.value.offsetHeight + 24;
}

function updateActiveSection() {
  if (scrollSpyLocked) return;
  const sectionIds = visiblePages.value.map(getSectionIdFromPage);
  const headerOffset = getScrollOffset();
  let currentSection = sectionIds[0];

  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= headerOffset + 100) {
        currentSection = id;
      }
    }
  }

  if (currentSection !== activeSection.value) {
    activeSection.value = currentSection;
  }

  const lastId = sectionIds[sectionIds.length - 1];
  const lastEl = document.getElementById(lastId);
  if (lastEl) {
    const rect = lastEl.getBoundingClientRect();
    showHint.value = rect.bottom <= window.innerHeight + 50;
  }
}

function handleScroll() {
  if (scrollRafId !== null) return;
  scrollRafId = requestAnimationFrame(() => {
    updateActiveSection();
    scrollRafId = null;
  });
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

function toggleContent() {
  isContentVisible.value = !isContentVisible.value;
}

function startExploration() {
  window.dispatchEvent(new CustomEvent("city:explore"));
}

function startDemoMode() {
  window.dispatchEvent(new CustomEvent("city:demo"));
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

  const isHome = window.location.pathname === "/" || window.location.pathname === "";
  if (!isHome) return;

  switch (e.key) {
    case "ArrowRight":
      navigatePage("next");
      break;
    case "ArrowLeft":
      navigatePage("prev");
      break;
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

function toggleTerminal() {
  terminal.value = !terminal.value;
}

function getSectionIdFromPage(page: Page): string {
  if (page.link === "/") return "home";
  return page.link.replace(/^\//, "");
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



function scrollToHash(hash: string) {
  if (!hash) {
    window.scrollTo({ top: 0, behavior: "auto" });
    activeSection.value = "home";
    lockScrollSpy(1200);
    return;
  }
  const sectionId = hash.replace(/^#/, "");
  const el = document.getElementById(sectionId);
  if (el) {
    const scrollOffset = getScrollOffset();
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - scrollOffset;
    window.scrollTo({ top: offsetPosition, behavior: "auto" });
    activeSection.value = sectionId;
    lockScrollSpy(1200);
  }
}

onMounted(() => {
  history.scrollRestoration = "manual";

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
  window.addEventListener("scroll", handleScroll, { passive: true });

  const contentEl = document.getElementById("content-wrapper");
  if (contentEl) {
    contentEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    contentEl.addEventListener("touchend", handleTouchEnd, { passive: true });
  }

  window.addEventListener("city:game-start", () => { gameMode.value = true; });
  window.addEventListener("city:game-end", () => { gameMode.value = false; });
  window.addEventListener("city:fallback", () => { cityFallback.value = true; });

  handleInitialHash();
  updateActiveSection();
});

watch(() => window.location.hash, (newHash) => {
  if (window.location.pathname !== "/") return;
  scrollToHash(newHash);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("city:game-start", () => {});
  window.removeEventListener("city:game-end", () => {});
  window.removeEventListener("city:fallback", () => {});
  const contentEl = document.getElementById("content-wrapper");
  if (contentEl) {
    contentEl.removeEventListener("touchstart", handleTouchStart);
    contentEl.removeEventListener("touchend", handleTouchEnd);
  }
  if (scrollRafId !== null) {
    cancelAnimationFrame(scrollRafId);
  }
  clearTimeout(scrollLockTimeout);
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
  background: linear-gradient(90deg, transparent, rgba(0, 255, 204, 0.4), rgba(255, 0, 204, 0.4), transparent);
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

.app-footer {
  padding: 1.5rem 0;
  text-align: center;
  border-top: 1px solid rgba(0, 255, 204, 0.1);
  opacity: 0.6;
  font-size: 0.85rem;
  cursor: pointer;
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
  transition: opacity 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
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

@media (max-width: 768px) {
  .header-nav {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
}
</style>
