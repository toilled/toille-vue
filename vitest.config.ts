import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

export default defineConfig({
  plugins: [
    vue(),
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
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setupThree.ts", "./src/tests/setupHead.ts"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
});
