import { renderToString } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import App from "./App";
import PageContent from "./components/PageContent";
import { lazy } from "solid-js";

// Not using the full routing tree for simple string render in SSR
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

export async function render(url: string) {
  const html = renderToString(() => (
    <Router url={url} root={App}>
      {routes.map(route => (
        <Route path={route.path} component={route.component} />
      ))}
    </Router>
  ));

  return html;
}
