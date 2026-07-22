<template>
  <div class="single-page-container">
    <section
      v-for="page in displayPages"
      :key="page.link"
      :id="getSectionId(page)"
      class="page-section"
      :class="`page-section--${getSectionId(page)}`"
      :style="page.accent ? pageStyleVars(page.accent) : undefined"
      :data-section="getSectionId(page)"
    >
      <article class="marginless page-content-card" :aria-label="page.title">
        <header>
          <h2 class="title">
            <template v-if="page">
              <span v-if="page.icon" class="page-icon">{{ page.icon }} </span>{{ page.title }}
            </template>
          </h2>
        </header>
        <div class="page-body">
          <Paragraph
            v-for="(paragraph, index) in page.body"
            :key="index"
            :paragraph="paragraph"
            :last="index + 1 === page.body.length"
          />
        </div>

        <PageSections
          v-if="page.sections?.length"
          v-bind="page.sections ? { sections: page.sections } : {}"
        />
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

const { t } = useI18n();
const { translatedPages } = useTranslatedPages();

function getSectionId(page: Page): string {
  if (page.link === '/') return 'home';
  return page.link.replace(/^\//, '');
}

const displayPages = computed(() => {
  return translatedPages.value.filter((page: Page) => !page.hidden);
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

const siteTitle = computed(() => t('site.title'));

useHead({
  title: siteTitle,
  meta: [
    { name: 'description', content: t('meta.defaultDescription') },
    { property: 'og:title', content: 'Elliot Dickerson' },
    { property: 'og:description', content: t('meta.defaultDescription') },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://toille.uk/' },
    { property: 'og:image', content: 'https://toille.uk/og-image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Elliot Dickerson' },
    { name: 'twitter:description', content: t('meta.defaultDescription') },
    { name: 'twitter:image', content: 'https://toille.uk/og-image.png' },
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://toille.uk/',
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
.single-page-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.page-section {
  scroll-margin-top: 80px;
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
  margin: 0 auto;
  position: relative;
}

.page-section::after {
  content: '';
  display: block;
  width: 30%;
  max-width: 120px;
  height: 1px;
  margin: 2.5rem auto 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 255, 204, 0.4),
    rgba(255, 0, 204, 0.3),
    transparent
  );
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--page-accent-rgb, 0, 255, 204), 0.4),
    transparent
  );
}

.page-section:last-child::after {
  display: none;
}

@media (max-width: 768px) {
  .page-section {
    scroll-margin-top: 180px;
  }
}

.page-content-card {
  padding: 2.5rem 3rem;
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
  animation: page-float 6s ease-in-out infinite;
}

@keyframes page-float {
  0%,
  100% {
    transform: rotateX(2deg) translateZ(20px) translateY(0);
  }
  50% {
    transform: rotateX(2deg) translateZ(20px) translateY(-4px);
  }
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

.page-content-card > header {
  display: flex;
  align-items: center;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(var(--page-accent-rgb, 0, 255, 204), 0.08);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.15);
}

.page-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.5rem;
}

.page-body {
  font-size: 0.95rem;
}

@media (max-width: 600px) {
  .single-page-container {
    gap: 1rem;
  }

  .page-section::after {
    margin-top: 1.5rem;
    width: 30%;
    max-width: 100px;
  }

  .page-content-card {
    padding: 1.25rem;
  }

  .page-body {
    font-size: 0.9rem;
  }
}
</style>
