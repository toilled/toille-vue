import { createSSRApp, createApp as createClientApp, type Plugin } from 'vue';
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import App from './App.vue';
import SinglePageContent from './components/SinglePageContent.vue';
import i18n from './i18n';

import './assets/main.css';

const routes = [
  { path: '/', component: SinglePageContent },
  { path: '/checker', component: () => import('./components/Checker.vue') },
  {
    path: '/noughts-and-crosses',
    component: () => import('./components/NoughtsAndCrosses.vue'),
  },
  { path: '/quiz', component: () => import('./components/Quiz.vue') },
  { path: '/playground', component: () => import('./components/CodePlayground.vue') },
  { path: '/:pathMatch(.*)*', component: () => import('./components/PageContent.vue') },
];

export function createApp(head?: Plugin, hydrate?: boolean) {
  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  });

  const pinia = createPinia();
  const app = hydrate ? createSSRApp(App) : createClientApp(App);
  if (head) {
    app.use(head);
  }
  app.use(pinia);
  app.use(router);
  app.use(i18n);

  return { app, router };
}
