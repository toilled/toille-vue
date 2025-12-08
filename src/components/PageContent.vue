<template>
  <main>
    <section v-if="loading">
      <header>
        <h2 class="title">Loading...</h2>
      </header>
    </section>
    <section v-else>
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
          :paragraph="`The page <strong>${route.params.name || route.path}</strong> does not exist!`"
          :last="true"
        />
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
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

const page = ref<any>(null);
const loading = ref(true);

const fetchContent = async () => {
  // If it's a 404 route (pathMatch), clear page and return.
  if (route.params.pathMatch) {
    page.value = null;
    loading.value = false;
    return;
  }

  loading.value = true;
  let url = "/api/page";
  if (route.params.name) {
    url += `?name=${route.params.name}`;
  }

  try {
    const res = await fetch(url);
    if (res.ok) {
      page.value = await res.json();
    } else {
      page.value = null;
    }
  } catch (e) {
    console.error("Failed to fetch page", e);
    page.value = null;
  } finally {
    loading.value = false;
  }
};

watch(() => route.fullPath, fetchContent, { immediate: true });

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
