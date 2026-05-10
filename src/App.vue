<template>
  <div id="content-wrapper" :class="{ 'fade-out': gameMode }">
    <header class="app-header">
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
              <Transition
                :name="transitionName"
                @before-leave="onBeforeLeave"
                @enter="onEnter"
                @after-enter="onAfterEnter"
              >
                <ErrorBoundary>
                  <component :is="Component" :key="route.path" />
                </ErrorBoundary>
              </Transition>
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
const transitionName = ref("cards");
const gameMode = ref(false);
const isContentVisible = ref(true);
const isClient = ref(false);
const showCity = computed(() => isClient.value && cityBackground.isEnabled.value);

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
  const currentIndex = visiblePages.value.findIndex(
    (page: Page) => page.link === route.path,
  );
  if (direction === "next" && currentIndex !== -1 && currentIndex < visiblePages.value.length - 1) {
    router.push(visiblePages.value[currentIndex + 1].link);
  } else if (direction === "prev" && currentIndex > 0) {
    router.push(visiblePages.value[currentIndex - 1].link);
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
    const gameRoutes = ["/game", "/noughts-and-crosses", "/checker", "/ask"];
    if (gameRoutes.includes(route.path)) {
      router.push("/hidden");
    }
  }

  switch (e.key) {
    case "ArrowRight":
      navigatePage("next");
      break;
    case "ArrowLeft":
      navigatePage("prev");
      break;
  }
}

function onBeforeLeave(el: Element) {
  if (containerRef.value) {
    const { height } = getComputedStyle(el);
    containerRef.value.style.height = height;
  }
}

function onEnter(el: Element) {
  if (containerRef.value) {
    const { height } = getComputedStyle(el);
    containerRef.value.style.height = height;
  }
}

function onAfterEnter() {
  if (containerRef.value) {
    containerRef.value.style.height = "";
  }
}

function getPageIndex(routeName: any) {
  if (routeName === "/") {
    return pages.findIndex((page) => page.link === "/");
  }

  const index = pages.findIndex((page) => page.link.slice(1) === routeName);
  return index === -1 ? Object.keys(pages).length : index;
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

onMounted(() => {
  isClient.value = true;

  setTimeout(() => {
    showHint.value = true;
  }, 2000);

  setTimeout(() => {
    showHint.value = false;
  }, 5000);

  // Input detection for sticky hover fix
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
});

onErrorCaptured((err) => {
  console.error("App Error Captured:", err);
  return true;
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  const contentEl = document.getElementById("content-wrapper");
  if (contentEl) {
    contentEl.removeEventListener("touchstart", handleTouchStart);
    contentEl.removeEventListener("touchend", handleTouchEnd);
  }
});

watch(
  () => route.path,
  (newPath, oldPath) => {
    if (oldPath) {
      const oldPageIndex = getPageIndex(oldPath.slice(1));
      const newPageIndex = getPageIndex(newPath.slice(1));

      transitionName.value =
        newPageIndex > oldPageIndex ? "cards" : "cards-reverse";
    }

    let pageTitle;

    switch (newPath) {
      case "/noughts-and-crosses":
        pageTitle = "Noughts and Crosses";
        break;
      case "/game":
        pageTitle = "Catch the Button!";
        break;
      case "/checker":
        pageTitle = "Checker";
        break;
      case "/ask":
        pageTitle = "Ask Me";
        break;
      default: {
        let routeName;
        if (route.params.name) {
          routeName = route.params.name;
        } else if (newPath === "/") {
          routeName = "home";
        }

        if (routeName) {
          let currentPage;
          if (routeName === "home") {
            currentPage = pages.find((page) => page.link === "/");
          } else {
            currentPage = pages.find(
              (page) => page.link.slice(1) === routeName,
            );
          }
          pageTitle = currentPage ? currentPage.title : "404";
        } else {
          pageTitle = "404";
        }
        break;
      }
    }

    if (typeof document !== "undefined") {
      document.title = "Elliot > " + pageTitle;
    }
  },
  { immediate: true },
);
</script>

<style>
/* ============================================
   Layout Structure
   ============================================ */
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
    gap: 0.75rem;
    align-items: stretch;
  }
}
</style>
