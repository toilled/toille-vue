/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    vue(),
    viteCompression(),
    viteCompression({ algorithm: "brotliCompress", ext: ".br" }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setupThree.ts", "./src/tests/setupHead.ts"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
  server: {
    port: 3000,
    proxy: {
      '/api/weather': {
        target: 'https://api.open-meteo.com',
        changeOrigin: true,
        rewrite: (_path) => {
          const params = new URLSearchParams({
            latitude: '51.9001',
            longitude: '-2.0877',
            current_weather: 'true',
            hourly: 'temperature_2m,rain',
            timezone: 'Europe/London'
          });
          return `/v1/forecast?${params}`;
        }
      }
    }
  },
  build: {
    target: "esnext",
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
