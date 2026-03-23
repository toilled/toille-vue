import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin({ ssr: true })],
  ssr: {
    noExternal: true, // Bundle everything for Worker
    target: 'webworker',
    resolve: {
      conditions: ['solid', 'node', 'import']
    }
  },
  build: {
    target: 'esnext',
    outDir: 'functions',
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      input: 'src/entry-server.tsx',
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
