import { createSSRApp } from "vue";
import { createRouter, createWebHistory, createMemoryHistory } from "vue-router";
import App from "./App.vue";
import PageContent from "./components/PageContent.vue";

/**
 * @file main.ts
 * @description The main entry point for the Vue application.
 * It sets up the Vue app, creates the router, and mounts the application to the DOM.
 */

/**
 * @const {Array<import('vue-router').RouteRecordRaw>} routes
 * @description An array of route definitions for the Vue Router.
 * - The root path `/` redirects to the first page defined in `pages.json`.
 * - `/checker` maps to the `Checker` component.
 * - `/game` maps to the `MiniGame` component.
 * - `/:name` is a dynamic route that maps to the `PageContent` component, passing the `name` as a prop.
 * - `/:pathMatch(.*)*` is a catch-all route for any other paths, also mapping to `PageContent` to display a 404 message.
 */
const routes = [
  { path: "/", component: PageContent, props: { name: "home" } },
  { path: "/:name", component: PageContent, props: true },
  { path: "/checker", component: () => import("./components/Checker.vue") },
  { path: "/game", component: () => import("./components/MiniGame.vue") },
  {
    path: "/noughts-and-crosses",
    component: () => import("./components/NoughtsAndCrosses.vue"),
  },
  { path: "/ask", component: () => import("./components/Ask.vue") },
  { path: "/:pathMatch(.*)*", component: PageContent },
];

export function createApp() {
  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  });

  const app = createSSRApp(App);
  app.use(router);

  return { app, router };
}
