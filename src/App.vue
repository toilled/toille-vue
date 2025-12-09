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
      <Menu :pages="visiblePages" />
    </nav>
    <div class="router-view-container" ref="containerRef">
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
    <Transition name="fade">
      <footer
        v-if="noFootersShowing && showHint"
        @click="checker = !checker"
        class="content-container"
      >
        <TypingText text="The titles might be clickable..." />
      </footer>
    </Transition>
  </div>
  <CyberpunkCity @game-start="gameMode = true" @game-end="gameMode = false" />
  <Transition name="fade">
    <Checker v-if="checker" />
  </Transition>
  <Transition name="fade">
    <Activity v-show="activity" />
  </Transition>
  <Transition name="fade">
    <Suggestion
      v-show="joke"
      url="https://icanhazdadjoke.com/"
      valueName="joke"
      title="Have a laugh!"
    />
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
const route = useRoute();
const router = useRouter();
const transitionName = ref("cards");
const gameMode = ref(false);

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowRight") {
    const currentIndex = visiblePages.value.findIndex((page: Page) => page.link === route.path);
    if (currentIndex !== -1 && currentIndex < visiblePages.value.length - 1) {
      router.push(visiblePages.value[currentIndex + 1].link);
    }
  } else if (e.key === "ArrowLeft") {
    const currentIndex = visiblePages.value.findIndex((page: Page) => page.link === route.path);
    if (currentIndex > 0) {
      router.push(visiblePages.value[currentIndex - 1].link);
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

onMounted(() => {
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

    if (newPath === '/noughts-and-crosses') {
      pageTitle = 'Noughts and Crosses';
    } else if (newPath === '/game') {
      pageTitle = 'Catch the Button!';
    } else if (newPath === '/checker') {
      pageTitle = 'Checker';
    } else {
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
</style>
