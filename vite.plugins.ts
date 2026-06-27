import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import type { Plugin } from "vite";

export function sharedPlugins(): Plugin[] {
  return [
    AutoImport({
      imports: ["vue", "vue-router"],
      dts: true,
    }),
    Components({
      dirs: ["src/components"],
      extensions: ["vue"],
      dts: true,
      exclude: ["**/CyberpunkCity.vue", "**/Checker.vue", "**/Activity.vue", "**/Suggestion.vue"],
    }),
  ];
}
