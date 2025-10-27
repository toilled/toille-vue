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
  <router-view v-slot="{ Component, route }">
    <Transition name="cards" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </router-view>
  <Starfield />
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
import TypingText from "./components/TypingText.vue";
import pages from "./configs/pages.json";
import titles from "./configs/titles.json";

const checker = ref(false);
const activity = ref(false);
const joke = ref(false);
const showHint = ref(false);
const route = useRoute();

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
  (newPath) => {
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
