<template>
  <div id="content-wrapper" :class="{ 'fade-out': gameMode }">
    <nav>
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
        @toggle-content="toggleContent"
      />
    </nav>
    <Transition name="cyberpunk-glitch">
      <div class="router-view-container" ref="containerRef" v-show="isContentVisible">
        <router-view v-slot="{ Component, route }">
          <Transition
            :name="transitionName"
            @before-leave="onBeforeLeave"
            @enter="onEnter"
            @after-enter="onAfterEnter"
          >
            <component :is="Component" :key="route.path" />
          </Transition>
        </router-view>
      </div>
    </Transition>
    <Transition name="fade">
      <footer
        v-if="noFootersShowing && showHint"
        v-show="isContentVisible"
        @click="checker = !checker"
        class="content-container"
      >
        <TypingText text="The titles might be clickable..." />
      </footer>
    </Transition>
  </div>
  <CyberpunkCity ref="cyberpunkCityRef" @game-start="gameMode = true" @game-end="gameMode = false" />
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
  <Transition name="glitch-fade">
    <SplashScreen v-if="showSplash" />
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, defineAsyncComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import Title from "./components/Title.vue";
import Menu from "./components/Menu.vue";
import Checker from "./components/Checker.vue";
import Activity from "./components/Activity.vue";
import Suggestion from "./components/Suggestion.vue";
import TypingText from "./components/TypingText.vue";
import SplashScreen from "./components/SplashScreen.vue";
import pages from "./configs/pages.json";

const CyberpunkCity = defineAsyncComponent(() =>
  import("./components/CyberpunkCity.vue")
);
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
const showSplash = ref(true);
const route = useRoute();
const router = useRouter();
const transitionName = ref("cards");
const gameMode = ref(false);
const isContentVisible = ref(true);

function toggleContent() {
  isContentVisible.value = !isContentVisible.value;
}

const cyberpunkCityRef = ref<any>(null);

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

function handleKeydown(e: KeyboardEvent) {
  if (gameMode.value) return;

  if (e.key === "Escape") {
    const gameRoutes = ['/game', '/noughts-and-crosses', '/checker', '/ask'];
    if (gameRoutes.includes(route.path)) {
      router.push('/hidden');
    }
  }

  switch (e.key) {
    case "ArrowRight": {
      const currentIndex = visiblePages.value.findIndex((page: Page) => page.link === route.path);
      if (currentIndex !== -1 && currentIndex < visiblePages.value.length - 1) {
        router.push(visiblePages.value[currentIndex + 1].link);
      }
      break;
    }
    case "ArrowLeft": {
      const currentIndex = visiblePages.value.findIndex((page: Page) => page.link === route.path);
      if (currentIndex > 0) {
        router.push(visiblePages.value[currentIndex - 1].link);
      }
      break;
    }
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

let splashTimeout: ReturnType<typeof setTimeout>;

onMounted(() => {
  splashTimeout = setTimeout(() => {
    showSplash.value = false;
  }, 500);

  setTimeout(() => {
    showHint.value = true;
  }, 2000);

  setTimeout(() => {
    showHint.value = false;
  }, 5000);

  // Input detection for sticky hover fix
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

  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  clearTimeout(splashTimeout);
  window.removeEventListener("keydown", handleKeydown);
});

watch(
  () => route.path,
  (newPath, oldPath) => {
    if (oldPath) {
      const oldPageIndex = getPageIndex(oldPath.slice(1));
      const newPageIndex = getPageIndex(newPath.slice(1));

      transitionName.value = newPageIndex > oldPageIndex ? 'cards' : 'cards-reverse';
    }

    let pageTitle;

    switch (newPath) {
      case '/noughts-and-crosses':
        pageTitle = 'Noughts and Crosses';
        break;
      case '/game':
        pageTitle = 'Catch the Button!';
        break;
      case '/checker':
        pageTitle = 'Checker';
        break;
      case '/ask':
        pageTitle = 'Ask Me';
        break;
      default: {
        let routeName;
        if (route.params.name) {
          routeName = route.params.name;
        } else if (newPath === '/') {
          routeName = 'home';
        }

        if (routeName) {
          let currentPage;
          if (routeName === 'home') {
            currentPage = pages.find((page) => page.link === '/');
          } else {
            currentPage = pages.find((page) => page.link.slice(1) === routeName);
          }
          pageTitle = currentPage ? currentPage.title : '404';
        } else {
          pageTitle = '404';
        }
        break;
      }
    }

    document.title = "Elliot > " + pageTitle;
  },
  { immediate: true },
);
</script>

<style>
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

/* Glitch Fade Transition for Splash Screen */
.glitch-fade-leave-active {
  animation: glitch-fade-out 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes glitch-fade-out {
  0% {
    opacity: 1;
    transform: translate(0);
    clip-path: inset(0 0 0 0);
  }
  10% {
    opacity: 1;
    transform: translate(-2px, 2px);
    clip-path: inset(10% 0 80% 0);
  }
  20% {
    opacity: 1;
    transform: translate(2px, -2px);
    clip-path: inset(80% 0 10% 0);
  }
  30% {
    opacity: 1;
    transform: translate(-2px, 2px);
    clip-path: inset(10% 0 80% 0);
  }
  40% {
    opacity: 1;
    transform: translate(2px, -2px);
    clip-path: inset(80% 0 10% 0);
  }
  50% {
    opacity: 1;
    transform: translate(-2px, 2px);
    clip-path: inset(10% 0 80% 0);
  }
  60% {
    opacity: 1;
    transform: translate(2px, -2px);
    clip-path: inset(80% 0 10% 0);
  }
  70% {
    opacity: 1;
    transform: translate(-2px, 2px);
    clip-path: inset(10% 0 80% 0);
  }
  80% {
    opacity: 1;
    transform: translate(2px, -2px);
    clip-path: inset(80% 0 10% 0);
  }
  90% {
    opacity: 1;
    transform: translate(-2px, 2px);
    clip-path: inset(10% 0 80% 0);
  }
  100% {
    opacity: 0;
    transform: translate(0);
    clip-path: inset(0 0 0 0);
  }
}

</style>

<style>
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
</style>
