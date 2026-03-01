import { onRequestGet as __api_multiplayer_ts_onRequestGet } from "/app/functions/api/multiplayer.ts"
import { onRequestGet as __api_scores_ts_onRequestGet } from "/app/functions/api/scores.ts"
import { onRequestPost as __api_scores_ts_onRequestPost } from "/app/functions/api/scores.ts"
import { onRequest as ____path___ts_onRequest } from "/app/functions/[[path]].ts"

export const routes = [
    {
      routePath: "/api/multiplayer",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_multiplayer_ts_onRequestGet],
    },
  {
      routePath: "/api/scores",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_scores_ts_onRequestGet],
    },
  {
      routePath: "/api/scores",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_scores_ts_onRequestPost],
    },
  {
      routePath: "/:path*",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [____path___ts_onRequest],
    },
  ]