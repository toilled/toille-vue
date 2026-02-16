import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        hydratable: true,
      }
    })
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
