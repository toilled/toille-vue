<template>
  <App />
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted } from 'vue';
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import { createI18n } from 'vue-i18n';
import { createHead } from '@unhead/vue/client';
import App from '../App.vue';
import { routes } from '../main';
import en from '../locales/en.json';
import { isFirefox } from '../utils/BrowserDetect';

const props = defineProps<{ url?: string }>();

const instance = getCurrentInstance();
const app = instance?.appContext.app;

if (app) {
  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory(props.url || '/') : createWebHistory(),
    routes,
  });

  app.use(router);

  function getInitialLocale(): string {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 'en';
    }
    const stored = localStorage.getItem('locale');
    if (stored) return stored;
    const browserLangs = navigator.languages || [navigator.language];
    for (const lang of browserLangs) {
      const normalized = lang.split('-')[0];
      const supported = [
        'en',
        'es',
        'fr',
        'de',
        'it',
        'pt',
        'ru',
        'ar',
        'zh',
        'ja',
        'ko',
        'hi',
        'nl',
      ];
      if (normalized === 'zh') return 'zh-CN';
      if (supported.includes(normalized)) return normalized;
    }
    return 'en';
  }

  type MessageSchema = typeof en;

  const i18n = createI18n<[MessageSchema], string>({
    legacy: false,
    locale: getInitialLocale(),
    fallbackLocale: 'en',
    warnHtmlMessage: false,
    messages: { en },
  });

  app.use(i18n);

  const head = createHead();
  app.use(head);
}

onMounted(() => {
  if (isFirefox()) {
    document.documentElement.classList.add('fx');
  }

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    if (window.matchMedia('(dynamic-range: high)').matches) {
      document.documentElement.classList.add('hdr');
    }
    if (window.matchMedia('(color-gamut: p3)').matches) {
      document.documentElement.classList.add('p3');
    }
  }
});
</script>
