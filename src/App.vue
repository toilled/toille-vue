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
    <Transition
      @enter="onEnter"
      @leave="onLeave"
      :css="false"
      mode="out-in"
    >
      <div class="wrapper" :key="route.path">
        <component :is="Component" />
      </div>
    </Transition>
  </router-view>
  <Starfield />
  <Transition name="fade">
    <footer v-if="noFootersShowing && showHint" @click="checker = !checker">
      The titles might be clickable...
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
import { spring } from "vue3-spring";
import Title from "./components/Title.vue";
import Menu from "./components/Menu.vue";
import Checker from "./components/Checker.vue";
import Activity from "./components/Activity.vue";
import Suggestion from "./components/Suggestion.vue";
import Starfield from "./components/Starfield.vue";
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

function onEnter(el: HTMLElement, done: () => void) {
  const s = spring(
    {
      transform: "perspective(1000px) rotateX(-90deg) scale3d(0.9, 0.9, 0.9)",
    },
    {
      stiffness: 150,
      onUpdate: (val) => {
        el.style.transform = val.transform;
      },
      onComplete: done,
    },
  );
  s.to({
    transform: "perspective(1000px) rotateX(0deg) scale3d(1, 1, 1)",
  });
}

function onLeave(el: HTMLElement, done: () => void) {
  el.style.position = 'absolute';
  const s = spring(
    {
      transform: "perspective(1000px) rotateX(0deg) scale3d(1, 1, 1)",
    },
    {
      stiffness: 150,
      onUpdate: (val) => {
        el.style.transform = val.transform;
      },
      onComplete: done,
    },
  );
  s.to({
    transform: "perspective(1000px) rotateX(90deg) scale3d(0.9, 0.9, 0.9)",
  });
}

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
  () => route.params.name,
  (newName) => {
    let currentPage;
    if (newName) {
      currentPage = pages.find((page) => page.link.slice(1) === newName);
    } else if (route.path === "/") {
      currentPage = pages[0];
    }
    document.title = "Elliot > " + (currentPage || { title: "404" }).title;
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

.wrapper {
  perspective: 1000px;
  overflow: hidden;
}
</style>