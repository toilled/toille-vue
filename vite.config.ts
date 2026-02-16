/// <reference types="vitest" />
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import viteCompression from 'vite-plugin-compression';

const isTest = process.env.VITEST === 'true';

export default defineConfig({
  plugins: [
    svelte(),
    viteCompression(),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  resolve: {
    conditions: isTest ? ['browser'] : undefined,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setupThree.ts"],
  },
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
});
