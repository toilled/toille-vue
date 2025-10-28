<template>
  <nav>
    <Title
      :title="titles.title"
      :subtitle="titles.subtitle"
      :activity="activity"
      :joke="joke"
      @activity="toggleActivity"
      @joke="toggleJoke"
    />
    <Menu :pages="pages" />
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
  <Starfield />
  <DVDLogo />
  <Transition name="fade">
    <footer
      v-if="noFootersShowing && showHint"
      @click="checker = !checker"
      class="content-container"
    >
      <TypingText text="The titles might be clickable..." />
    </footer>
  </Transition>
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
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import Title from "./components/Title.vue";
import Menu from "./components/Menu.vue";
import Checker from "./components/Checker.vue";
import Activity from "./components/Activity.vue";
import Suggestion from "./components/Suggestion.vue";
import Starfield from "./components/Starfield.vue";
import DVDLogo from "./components/DVDLogo.vue";
import TypingText from "./components/TypingText.vue";
import pages from "./configs/pages.json";
import titles from "./configs/titles.json";

const containerRef = ref<HTMLElement | null>(null);
const checker = ref(false);
const activity = ref(false);
const joke = ref(false);
const showHint = ref(false);
const route = useRoute();
const transitionName = ref("cards");

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
  if (routeName === '/') {
    return pages.findIndex((page) => page.link === '/');
  }
  return pages.findIndex((page) => page.link.slice(1) === routeName);
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
</style>
