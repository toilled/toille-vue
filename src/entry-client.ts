import { createApp } from "./main";
import { isFirefox } from "./utils/BrowserDetect";

if (isFirefox()) {
  document.documentElement.classList.add("fx");
}

if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  if (window.matchMedia("(dynamic-range: high)").matches) {
    document.documentElement.classList.add("hdr");
  }
  if (window.matchMedia("(color-gamut: p3)").matches) {
    document.documentElement.classList.add("p3");
  }
}

const { app, router } = createApp();

router.isReady().then(() => {
  const appEl = document.getElementById("app");
  if (appEl && appEl.innerHTML === "<!--app-html-->") {
    appEl.innerHTML = "";
  }
  app.mount("#app");
});
