import { createSSRApp } from "vue";
import { createRouter, createWebHistory, createMemoryHistory } from "vue-router";
import { createHead } from "@vueuse/head";
import App from "./App.vue";
import SinglePageContent from "./components/SinglePageContent.vue";

import "./assets/pico.min.css";
import "./assets/main.css";

const routes = [
  { path: "/", component: SinglePageContent },
  { path: "/checker", component: () => import("./components/Checker.vue") },
  {
    path: "/noughts-and-crosses",
    component: () => import("./components/NoughtsAndCrosses.vue"),
  },
  { path: "/ask", component: () => import("./components/Ask.vue") },
  { path: "/:pathMatch(.*)*", component: SinglePageContent },
];

export function createApp() {
  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  });

  const app = createSSRApp(App);
  const head = createHead();
  app.use(router);
  app.use(head);

  return { app, router, head };
}
