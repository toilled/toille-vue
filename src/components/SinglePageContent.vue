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

        <template v-for="(section, index) in page.sections" :key="index">
          <SectionDivider
            v-if="section.type === 'divider'"
            v-bind="section.icon ? { icon: section.icon } : {}"
          />

          <template v-if="section.type === 'cards'">
            <h3 v-if="section.heading" class="sub-heading">{{ section.heading }}</h3>
            <div class="what-i-do-grid" :style="{ '--columns': section.columns || 3 }">
              <div v-for="(item, i) in section.items" :key="i" class="do-card">
                <div class="do-card-accent" :class="accentClass(i)"></div>
                <div class="do-card-icon">{{ item.icon }}</div>
                <h4 class="do-card-title">{{ item.title }}</h4>
                <p class="do-card-desc">{{ item.description }}</p>
              </div>
            </div>
          </template>

          <template v-if="section.type === 'skills'">
            <h3 v-if="section.heading" class="sub-heading">{{ section.heading }}</h3>
            <SkillCard
              v-for="(group, i) in section.groups"
              :key="i"
              :skills="group.skills ?? []"
              v-bind="group.category ? { category: group.category } : {}"
            />
          </template>

          <template v-if="section.type === 'musicCard'">
            <h3 v-if="section.heading" class="sub-heading">{{ section.heading }}</h3>
            <div class="music-card">
              <div v-if="section.icon" class="music-icon">{{ section.icon }}</div>
              <div class="music-content">
                <h4>{{ section.title }}</h4>
                <p>{{ section.description }}</p>
                <a
                  v-if="section.linkUrl"
                  :href="section.linkUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="music-link"
                >
                  {{ section.linkText }}
                </a>
              </div>
            </div>
          </template>

          <template v-if="section.type === 'interestGrid'">
            <div class="interest-grid">
              <div v-for="(item, i) in section.items" :key="i" class="interest-item">
                <span class="interest-icon">{{ item.icon }}</span>
                <span>{{ item.text }}</span>
              </div>
            </div>
          </template>
        </template>
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

function accentClass(index: number): string {
  const classes = ['fullstack', 'ux', 'interactive'];
  return classes[index % classes.length];
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
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: linear-gradient(135deg, rgba(10, 10, 30, 0.75), rgba(20, 5, 40, 0.6));
  border: 1px solid rgba(var(--page-accent-rgb, 0, 255, 204), 0.2);
  box-shadow:
    0 0 20px rgba(var(--page-accent-rgb, 0, 255, 204), 0.08),
    0 8px 32px rgba(0, 0, 0, 0.4);
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
    135deg,
    var(--page-accent, #00ffcc),
    transparent 50%,
    var(--page-accent, #00ffcc)
  );
  opacity: 0.06;
  pointer-events: none;
  z-index: -1;
}

.page-content-card > header {
  display: flex;
  align-items: center;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.page-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.5rem;
}

.page-body {
  font-size: 0.95rem;
}

.sub-heading {
  margin: 1.75rem 0 1rem 0;
  font-size: 1.1rem;
  color: #ff00cc;
  letter-spacing: 0.02em;
}

.what-i-do-grid {
  display: grid;
  grid-template-columns: repeat(var(--columns, 3), 1fr);
  gap: 1rem;
  margin: 1.25rem 0;
}

.do-card {
  position: relative;
  padding: 1.5rem 1.25rem;
  background: rgba(10, 10, 20, 0.5);
  border: 1px solid rgba(0, 255, 204, 0.12);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.35s ease;
}

.can-hover .do-card:hover {
  background: rgba(15, 20, 40, 0.7);
  border-color: rgba(0, 255, 204, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.can-hover .do-card:hover .do-card-accent {
  height: 4px;
  filter: brightness(1.3);
  box-shadow: 0 0 12px currentColor;
}

.do-card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 14px 14px 0 0;
  transition: all 0.35s ease;
}

.do-card-accent.fullstack {
  background: linear-gradient(90deg, #00ffcc, #00ccff);
}

.do-card-accent.ux {
  background: linear-gradient(90deg, #ff00cc, #ff6600);
}

.do-card-accent.interactive {
  background: linear-gradient(90deg, #cc00ff, #00ffcc);
}

.do-card-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  display: block;
}

.do-card-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #fff;
  letter-spacing: 0.01em;
}

.do-card-desc {
  margin: 0;
  font-size: 0.82rem;
  color: #b0b0cc;
  line-height: 1.55;
}

.music-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 0, 204, 0.08), rgba(0, 255, 204, 0.08));
  border: 1px solid rgba(255, 0, 204, 0.2);
  border-radius: 14px;
  margin: 1.25rem 0;
  transition: all 0.3s ease;
}

.can-hover .music-card:hover {
  background: linear-gradient(135deg, rgba(255, 0, 204, 0.12), rgba(0, 255, 204, 0.12));
  border-color: rgba(255, 0, 204, 0.35);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.music-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.music-content h4 {
  margin: 0 0 0.4rem 0;
  font-size: 1rem;
  color: #fff;
}

.music-content p {
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  color: #b0b0cc;
}

.music-link {
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.interest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin: 1.25rem 0;
}

.interest-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(10, 10, 20, 0.5);
  border: 1px solid rgba(0, 255, 204, 0.12);
  border-radius: 10px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.can-hover .interest-item:hover {
  background: rgba(20, 30, 60, 0.6);
  border-color: rgba(0, 255, 204, 0.25);
  transform: translateY(-1px);
}

.interest-icon {
  font-size: 1.25rem;
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

  .music-card {
    flex-direction: column;
    text-align: center;
  }

  .interest-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .what-i-do-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>
