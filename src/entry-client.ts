import { createApp } from "./main";

const { app, router } = createApp();

router.isReady().then(() => {
  const appEl = document.getElementById("app");
  if (appEl && appEl.innerHTML === "<!--app-html-->") {
    appEl.innerHTML = "";
  }
  app.mount("#app");
});
