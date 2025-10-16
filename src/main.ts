import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import "@picocss/pico";
import "./index.css";
import App from "./App.vue";
import PageContent from "./components/PageContent.vue";
import Checker from "./components/Checker.vue";
import MiniGame from "./components/MiniGame.vue";
import pages from "./configs/pages.json";

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
  { path: "/", redirect: pages[0].link },
  { path: "/:name", component: PageContent, props: true },
  { path: "/checker", component: Checker },
  { path: "/game", component: MiniGame },
  { path: "/:pathMatch(.*)*", component: PageContent },
];

/**
 * @const {import('vue-router').Router} router
 * @description The Vue Router instance, configured with web history and the defined routes.
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * @const {import('vue').App} app
 * @description The root Vue application instance.
 */
const app = createApp(App);

app.use(router);
app.mount("#app");