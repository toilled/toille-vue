<template>
  <main>
    <section>
      <article class="marginless">
        <header>
          <h2 class="title" @mousedown="handleMouseDown">
            <template v-if="page">
              <span v-if="page.icon" class="page-icon">{{ page.icon }} </span>{{ page.title }}
              <Transition name="fade">
                <span
                  v-if="showHint"
                  style="
                    font-weight: 100;
                    font-style: italic;
                    font-size: 0.6em;
                    vertical-align: middle;
                  "
                >
                  - Nothing here
                </span>
              </Transition>
            </template>
            <template v-else> 404 - Page not found </template>
          </h2>
        </header>
        <template v-if="page">
          <Paragraph
            v-for="(paragraph, index) in page.body"
            :key="index"
            :paragraph="paragraph"
            :last="index + 1 === page.body.length"
          />
        </template>
        <template v-else>
          <Paragraph
            :paragraph="`The page <strong>${props.name || route.params.name}</strong> does not exist!`"
            :last="true"
          />
        </template>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import pages from "../configs/pages.json";
import Paragraph from "./Paragraph.vue";
import { useWindowManager } from "../composables/useWindowManager";

// Import other apps that might be linked
import { defineAsyncComponent } from "vue";
const Checker = defineAsyncComponent(() => import("./Checker.vue"));
const MiniGame = defineAsyncComponent(() => import("./MiniGame.vue"));
const NoughtsAndCrosses = defineAsyncComponent(() => import("./NoughtsAndCrosses.vue"));
const Ask = defineAsyncComponent(() => import("./Ask.vue"));

const props = defineProps<{
  name?: string;
}>();

const { openWindow } = useWindowManager();
const showHint = ref(false);
const route = useRoute();

const page = computed(() => {
  const targetName = props.name || (route.params.name as string);

  if (targetName) {
    return pages.find((p) => p.link.slice(1) === targetName || (targetName === 'home' && p.link === '/'));
  }
  return pages[0];
});

// Intercept link clicks to open in new windows instead of navigating route
function handleLinkClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.tagName === 'A') {
    const href = target.getAttribute('href');
    if (href && href.startsWith('/')) {
      e.preventDefault();

      const routeName = href.replace('/', '');

      switch (routeName) {
        case 'checker':
          openWindow("Alcohol Checker", Checker, {});
          break;
        case 'game':
          openWindow("Catch the Button!", MiniGame, {}, { isFullScreen: true });
          break;
        case 'noughts-and-crosses':
          openWindow("Noughts and Crosses", NoughtsAndCrosses, {}, { isFullScreen: true });
          break;
        case 'ask':
          openWindow("Ask Me", Ask, {});
          break;
        default:
          const targetPage = pages.find((p) => p.link === href);
          if (targetPage) {
             openWindow(targetPage.title, PageContent, { name: routeName || 'home' });
          } else {
             openWindow("404", PageContent, { name: routeName });
          }
          break;
      }
    }
  }
}

import { onMounted, onUnmounted, getCurrentInstance } from 'vue';

const instance = getCurrentInstance();

onMounted(() => {
   if (instance?.vnode.el) {
       (instance.vnode.el as HTMLElement).addEventListener('click', handleLinkClick);
   }
});

onUnmounted(() => {
   if (instance?.vnode.el) {
       (instance.vnode.el as HTMLElement).removeEventListener('click', handleLinkClick);
   }
});

/**
 * @description Handles the mouse down event on the title, showing a hint for a short duration.
 */
function handleMouseDown() {
  showHint.value = true;
  setTimeout(() => {
    showHint.value = false;
  }, 500);
}

</script>