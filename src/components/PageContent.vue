<template>
  <main id="main-content">
    <section>
      <article class="marginless page-content-card">
        <header>
          <h2 class="title" @mousedown="handleMouseDown">
            <template v-if="page">
              <span v-if="page.icon" class="page-icon">{{ page.icon }} </span>{{ page.title }}
              <Transition name="fade">
                <span
                  v-if="showHint"
                  class="page-hint"
                >
                  - Nothing here
                </span>
              </Transition>
            </template>
            <template v-else> 404 - Page not found </template>
          </h2>
        </header>
        <div class="page-body">
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
              :last="false"
            />
            <div class="not-found-nav">
              <h3>Available Pages:</h3>
              <ul>
                <li v-for="p in availablePages" :key="p.link">
                  <router-link :to="p.link">{{ p.icon }} {{ p.name }}</router-link>
                </li>
              </ul>
              <router-link to="/" class="button outline">Go Home</router-link>
            </div>
          </template>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@vueuse/head";
import pages from "../configs/pages.json";
import Paragraph from "./Paragraph.vue";
import { Page } from "../interfaces/Page";

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
    ) as Page | undefined;
  }
  if (route.params.pathMatch) {
    return null;
  }
  return pages[0] as Page;
});

const availablePages = computed(() => {
  return pages.filter((p: Page) => !p.hidden);
});

/**
 * @description Sets dynamic head meta tags based on the current page.
 */
useHead({
  title: computed(() => {
    const pageTitle = page.value?.title || "404";
    return `Elliot > ${pageTitle}`;
  }),
  meta: computed(() => {
    const metaTags = [
      {
        name: "description",
        content: page.value?.metaDescription || "The experimental website of Elliot Dickerson made in Vue.",
      },
    ];
    if (page.value?.metaKeywords) {
      metaTags.push({
        name: "keywords",
        content: page.value.metaKeywords,
      });
    }
    if (page.value?.hidden) {
      metaTags.push({
        name: "robots",
        content: "noindex",
      });
    }
    // Open Graph tags
    metaTags.push(
      { property: "og:title", content: page.value?.title || "Elliot Dickerson" },
      { property: "og:description", content: page.value?.metaDescription || "The experimental website of Elliot Dickerson made in Vue." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `https://toille.uk${route.path}` },
      { property: "og:image", content: "https://toille.uk/og-image.png" },
    );
    // Twitter Card tags
    metaTags.push(
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: page.value?.title || "Elliot Dickerson" },
      { name: "twitter:description", content: page.value?.metaDescription || "The experimental website of Elliot Dickerson made in Vue." },
      { name: "twitter:image", content: "https://toille.uk/og-image.png" },
    );
    return metaTags;
  }),
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

<style scoped>
.page-content-card {
  padding: 1.5rem 2rem;
}

.page-content-card > header {
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.page-hint {
  font-weight: 100;
  font-style: italic;
  font-size: 0.6em;
  vertical-align: middle;
}

.page-body {
  font-size: 0.95rem;
}

@media (max-width: 600px) {
  .page-content-card {
    padding: 1rem 1.25rem;
  }
  .page-body {
    font-size: 0.9rem;
  }
}
</style>