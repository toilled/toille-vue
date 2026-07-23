/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import brotliCompress, { CompressionType } from "vite-plugin-bundler";
import { sharedPlugins } from "./vite.plugins";

export default defineConfig({
  plugins: [
    vue(),
    ...sharedPlugins(),
    brotliCompress({
      type: CompressionType.BOTH,
      threshold: 1024,
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setupThree.ts", "./src/tests/setupHead.ts", "./src/tests/setupI18n.ts", "./src/tests/setupA11y.ts"],
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
