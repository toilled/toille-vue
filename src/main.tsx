import { lazy } from "solid-js";
import { Router, Route } from "@solidjs/router";
import App from "./App";
import PageContent from "./components/PageContent";

import "./assets/pico.min.css";
import "./assets/main.css";

const routes = [
  {
    path: "/",
    component: () => <PageContent name="home" />
  },
  {
    path: "/checker",
    component: lazy(() => import("./components/Checker"))
  },
  {
    path: "/game",
    component: lazy(() => import("./components/MiniGame"))
  },
  {
    path: "/noughts-and-crosses",
    component: lazy(() => import("./components/NoughtsAndCrosses"))
  },
  {
    path: "/ask",
    component: lazy(() => import("./components/Ask"))
  },
  {
    path: "/:name",
    component: PageContent
  },
  {
    path: "*",
    component: PageContent
  }
];

export function createApp() {
  return function AppRouter() {
    return (
      <Router root={App}>
        {routes.map(route => (
          <Route path={route.path} component={route.component} />
        ))}
      </Router>
    );
  };
}
