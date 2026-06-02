import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router"],
      dts: true,
    }),
    Components({
      dirs: ["src/components"],
      extensions: ["vue"],
      dts: true,
      exclude: ["**/CyberpunkCity.vue"],
    }),
  ],
  ssr: {
    noExternal: true, // Bundle everything for Worker
    target: 'webworker',
  },
  build: {
    target: 'esnext',
    outDir: 'functions',
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      input: 'src/entry-server.ts',
      output: {
        entryFileNames: 'ssr-app.js',
        format: 'esm',
      },
    },
  },
  define: {
    // Basic polyfills for libraries that might expect them
    'process.env.NODE_ENV': JSON.stringify('production'),
  }
});
