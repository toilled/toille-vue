<template>
  <div>
    <section>
      <article
        class="marginless page-content-card"
        :style="page?.accent ? pageStyleVars(page.accent) : undefined"
        :aria-label="page?.title || t('notFound.pageNotFound')"
      >
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
          <PageNotFound v-else :name="String(route.params.name)" :pages="availablePages" />
        </div>

        <PageSections v-if="page" v-bind="page.sections ? { sections: page.sections } : {}" />
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import { Page } from '../interfaces/Page';
import { useTranslatedPages } from '../composables/useTranslatedPages';
import PageSections from './PageSections.vue';
import PageNotFound from './PageNotFound.vue';

const { t } = useI18n();
const { translatedPages } = useTranslatedPages();

const route = useRoute();

const page = computed(() => {
  if (route.params.name) {
    return translatedPages.value.find((p) => p.link.slice(1) === route.params.name) as
      | Page
      | undefined;
  }
  if (route.params.pathMatch) {
    const raw = Array.isArray(route.params.pathMatch)
      ? route.params.pathMatch[0]
      : route.params.pathMatch;
    const matchLink = '/' + raw;
    return translatedPages.value.find((p) => p.link === matchLink) as Page | undefined;
  }
  return translatedPages.value[0] as Page;
});

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 204';
}

function pageStyleVars(accent: string): Record<string, string> {
  return {
    '--page-accent': accent,
    '--page-accent-rgb': hexToRgb(accent),
  };
}

const availablePages = computed(() => {
  return translatedPages.value.filter((p: Page) => !p.hidden);
});

/**
 * @description Sets dynamic head meta tags based on the current page.
 */
const pageTitle = computed(() => {
  const t = page.value?.title || '404';
  return `${t} | Elliot Dickerson`;
});

const description = computed(() => page.value?.metaDescription || t('meta.defaultDescription'));

const pageMeta = computed(() => {
  const tags = [
    { name: 'description', content: description.value },
    { property: 'og:title', content: page.value?.title || 'Elliot Dickerson' },
    { property: 'og:description', content: description.value },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `https://toille.uk${route.path}` },
    { property: 'og:image', content: 'https://toille.uk/og-image.png' },
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
  link: [
    {
      rel: 'canonical',
      href: `https://toille.uk${route.path}`,
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Elliot Dickerson',
        jobTitle: 'Software Engineer',
        url: 'https://toille.uk',
        sameAs: [],
      }),
    },
  ],
});
</script>

<style scoped>
.page-content-card {
  padding: 1.5rem 2rem;
  position: relative;
  overflow: hidden;
  transform: rotateX(2deg) translateZ(20px);
  transform-style: preserve-3d;
  backdrop-filter: blur(12px) saturate(1.1);
  -webkit-backdrop-filter: blur(12px) saturate(1.1);
  background: linear-gradient(
    165deg,
    rgba(10, 10, 30, 0.8) 0%,
    rgba(5, 5, 20, 0.9) 50%,
    rgba(10, 5, 25, 0.85) 100%
  );
  border: 1px solid rgba(var(--page-accent-rgb, 0, 255, 204), 0.2);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.2),
    0 16px 48px rgba(0, 0, 0, 0.15),
    0 32px 80px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(var(--page-accent-rgb, 0, 255, 204), 0.05),
    0 0 20px rgba(var(--page-accent-rgb, 0, 255, 204), 0.06);
  animation: pc-float 6s ease-in-out infinite;
}

@keyframes pc-float {
  0%,
  100% {
    transform: rotateX(2deg) translateZ(20px) translateY(0);
  }
  50% {
    transform: rotateX(2deg) translateZ(20px) translateY(-4px);
  }
}

.page-content-card > header {
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(var(--page-accent-rgb, 0, 255, 204), 0.08);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.15);
}

.page-content-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 1.5rem;
  right: 1.5rem;
  height: 2px;
  border-radius: 0 0 2px 2px;
  background: linear-gradient(90deg, transparent, var(--page-accent, #00ffcc), transparent);
  transition: all 0.4s ease;
  box-shadow: 0 0 8px rgba(var(--page-accent-rgb, 0, 255, 204), 0.3);
}

.page-content-card::after {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border-radius: inherit;
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.04) 0%,
    transparent 30%,
    transparent 70%,
    rgba(var(--page-accent-rgb, 0, 255, 204), 0.03) 100%
  );
  pointer-events: none;
  z-index: -1;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
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
