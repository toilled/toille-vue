<template>
  <main>
    <section>
      <article class="marginless">
        <header>
          <h2 class="title" @mousedown="handleMouseDown">
            <template v-if="page">
              {{ page.title }}
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
            :paragraph="`The page <strong>${route.params.name}</strong> does not exist!`"
            :last="true"
          />
        </template>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import pages from "../configs/pages.json";
import Paragraph from "./Paragraph.vue";

/**
 * @file PageContent.vue
 * @description Renders the main content of a page based on the current route.
 * It displays the page title and body, or a 404 message if the page is not found.
 */

/**
 * @type {import('vue').Ref<boolean>}
 * @description A reactive reference to control the visibility of a hint on the title.
 */
const showHint = ref(false);

/**
 * @type {import('vue-router').RouteLocationNormalizedLoaded}
 * @description The current route object provided by `vue-router`.
 */
const route = useRoute();

/**
 * @type {import('vue').ComputedRef<Page | null | undefined>}
 * @description A computed property that finds the page object from `pages.json` that matches the current route's `name` parameter.
 * Returns the page object, `null` for a 404, or the first page as a default.
 */
const page = computed(() => {
  if (route.params.name) {
    return (
      pages.find((p) => p.link.slice(1) === route.params.name)
    );
  }
  if (route.params.pathMatch) {
    return null;
  }
  return pages[0];
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