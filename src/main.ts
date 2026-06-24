import { createSSRApp, createApp as createClientApp, type Plugin } from 'vue';
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import App from './App.vue';
import SinglePageContent from './components/SinglePageContent.vue';
import PageContent from './components/PageContent.vue';
import i18n from './i18n';

import './assets/main.css';

const routes = [
  { path: '/', component: SinglePageContent },
  { path: '/checker', component: () => import('./components/Checker.vue') },
  {
    path: '/noughts-and-crosses',
    component: () => import('./components/NoughtsAndCrosses.vue'),
  },
  { path: '/ask', component: () => import('./components/Ask.vue') },
  { path: '/quiz', component: () => import('./components/Quiz.vue') },
  { path: '/:pathMatch(.*)*', component: PageContent },
];

export function createApp(head?: Plugin, hydrate?: boolean) {
  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  });

  const app = hydrate ? createSSRApp(App) : createClientApp(App);
  if (head) {
    app.use(head);
  }
  app.use(router);
  app.use(i18n);

  return { app, router };
}
