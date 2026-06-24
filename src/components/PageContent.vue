<template>
  <div>
    <section>
      <article class="marginless page-content-card">
        <header>
          <h2 class="title">
            <template v-if="page">
              <span v-if="page.icon" class="page-icon">{{ page.icon }} </span>{{ page.title }}
              <span class="page-hint">{{ t('notFound.nothingHere') }}</span>
            </template>
            <template v-else> {{ t('notFound.pageNotFound') }} </template>
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
              :paragraph="t('notFound.pageDoesNotExist', { name: route.params.name })"
              :last="false"
            />
            <div class="not-found-nav">
              <h3>{{ t('notFound.availablePages') }}</h3>
              <ul>
                <li v-for="p in availablePages" :key="p.link">
                  <router-link :to="p.link">{{ p.icon }} {{ p.name }}</router-link>
                </li>
              </ul>
              <router-link to="/" class="button outline">{{ t('notFound.goHome') }}</router-link>
            </div>
          </template>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import { Page } from '../interfaces/Page';
import { useTranslatedPages } from '../composables/useTranslatedPages';

const { t } = useI18n();
const { translatedPages } = useTranslatedPages();

/**
 * @file PageContent.vue
 * @description Renders the main content of a page based on the current route.
 * It displays the page title and body, or a 404 message if the page is not found.
 */

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
    return translatedPages.value.find((p) => p.link.slice(1) === route.params.name) as
      | Page
      | undefined;
  }
  if (route.params.pathMatch) {
    return null;
  }
  return translatedPages.value[0] as Page;
});

const availablePages = computed(() => {
  return translatedPages.value.filter((p: Page) => !p.hidden);
});

/**
 * @description Sets dynamic head meta tags based on the current page.
 */
const pageTitle = computed(() => {
  const t = page.value?.title || '404';
  return `Elliot > ${t}`;
});

const description = computed(() => page.value?.metaDescription || t('meta.defaultDescription'));

const pageMeta = computed(() => {
  const tags: { name: string; content: string }[] = [
    { name: 'description', content: description.value },
    { name: 'og:title', content: page.value?.title || 'Elliot Dickerson' },
    { name: 'og:description', content: description.value },
    { name: 'og:type', content: 'website' },
    { name: 'og:url', content: `https://toille.uk${route.path}` },
    { name: 'og:image', content: 'https://toille.uk/og-image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: page.value?.title || 'Elliot Dickerson' },
    { name: 'twitter:description', content: description.value },
    { name: 'twitter:image', content: 'https://toille.uk/og-image.png' },
  ];
  if (page.value?.metaKeywords) {
    tags.push({ name: 'keywords', content: page.value.metaKeywords });
  }
  if (page.value?.hidden) {
    tags.push({ name: 'robots', content: 'noindex' });
  }
  return tags;
});

useHead({
  title: pageTitle,
  meta: pageMeta,
});
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
