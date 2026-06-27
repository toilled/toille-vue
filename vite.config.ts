/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import viteCompression from "vite-plugin-compression";
import { sharedPlugins } from "./vite.plugins";

export default defineConfig({
  plugins: [
    vue(),
    ...sharedPlugins(),
    viteCompression(),
    viteCompression({ algorithm: "brotliCompress", ext: ".br" }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setupThree.ts", "./src/tests/setupHead.ts", "./src/tests/setupI18n.ts"],
    testTimeout: 20000,
    maxConcurrency: 4,
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id: string): string | undefined {
          if (id.includes("node_modules")) {
            if (id.includes("three")) {
              return "three-vendor";
            }
          }
          return undefined;
        },
      },
    },
  },
});
