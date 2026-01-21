<template>
  <div class="site-overlay-wrapper">
    <!-- Navigation Bar -->
    <div :class="{ 'fade-out': isGameMode }">
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

      <!-- Footer Hint -->
      <Transition name="fade">
        <footer
          v-if="noFootersShowing && showHint"
          @click="checker = !checker"
          class="content-container hint-footer"
        >
          <TypingText text="The titles might be clickable..." />
        </footer>
      </Transition>
    </div>

    <!-- Modals -->
    <Transition name="fade">
      <Checker v-if="checker" :class="{ 'fade-out': isGameMode }" />
    </Transition>
    <Transition name="fade">
      <Activity v-show="activity" :class="{ 'fade-out': isGameMode }" />
    </Transition>
    <Transition name="fade">
      <Suggestion
        v-show="joke"
        :class="{ 'fade-out': isGameMode }"
        url="https://icanhazdadjoke.com/"
        valueName="joke"
        title="Have a laugh!"
      />
    </Transition>
    <Transition name="glitch-fade">
      <SplashScreen v-if="showSplash" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStore } from '@nanostores/vue';
import { isGameMode as isGameModeAtom } from "../stores/gameStore";
import Title from "./Title.vue";
import Menu from "./Menu.vue";
import TypingText from "./TypingText.vue";
import SplashScreen from "./SplashScreen.vue";
import Checker from "./Checker.vue";
import Activity from "./Activity.vue";
import Suggestion from "./Suggestion.vue";
import titles from "../configs/titles.json";
import pages from "../configs/pages.json";
import { Page } from "../interfaces/Page";

const isGameMode = useStore(isGameModeAtom);

const visiblePages = computed(() => {
  return pages.filter((page: Page) => !page.hidden);
});

const checker = ref(false);
const activity = ref(false);
const joke = ref(false);
const showHint = ref(false);
const showSplash = ref(false);

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

  const onTouchStart = () => {
    lastTouchTime = Date.now();
    document.body.classList.remove('can-hover');
  };

  const onMouseMove = () => {
    if (Date.now() - lastTouchTime > 500) {
      document.body.classList.add('can-hover');
    }
  };

  document.body.addEventListener('touchstart', onTouchStart);
  document.body.addEventListener('mousemove', onMouseMove);

  // Clean up
  onUnmounted(() => {
    document.body.removeEventListener('touchstart', onTouchStart);
    document.body.removeEventListener('mousemove', onMouseMove);
    clearTimeout(splashTimeout);
  });
});
</script>

<style scoped>
.hint-footer {
  cursor: pointer;
  text-align: center;
  padding: 1rem;
}
</style>
