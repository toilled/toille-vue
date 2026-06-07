import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

export default defineConfig({
  integrations: [vue()],
  site: "https://toille.uk",
  output: "static",
  build: {
    assets: "_assets",
  },
  vite: {
    plugins: [
      AutoImport({
        imports: ["vue"],
        dts: false,
      }),
      Components({
        dirs: ["src/components"],
        extensions: ["vue"],
        dts: false,
        exclude: ["**/CyberpunkCity.vue"],
      }),
    ],
    ssr: {
      noExternal: ["three", "dompurify"],
    },
  },
});
