import { createApp } from './main';
import { createHead } from '@unhead/vue/client';
import { isFirefox } from './utils/BrowserDetect';

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

const head = createHead();
const appEl = document.getElementById('app');
const hasSSRContent = !!(
  appEl &&
  appEl.innerHTML !== '<!--app-html-->' &&
  appEl.children.length > 0
);
const { app, router } = createApp(head, hasSSRContent);

if (appEl && !hasSSRContent) {
  appEl.innerHTML = '';
}

router.isReady().then(() => {
  app.mount('#app');
});
