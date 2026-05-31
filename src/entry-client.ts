import { createApp } from "./main";
import { isFirefox } from "./utils/BrowserDetect";

if (isFirefox()) {
  document.documentElement.classList.add("fx");
}

const { app, router } = createApp();

router.isReady().then(() => {
  const appEl = document.getElementById("app");
  if (appEl && appEl.innerHTML === "<!--app-html-->") {
    appEl.innerHTML = "";
  }
  app.mount("#app");
});
