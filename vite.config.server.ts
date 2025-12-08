import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    ssr: true,
    outDir: "functions",
    rollupOptions: {
      input: "src/entry-server.ts",
      output: {
        entryFileNames: "[name].js",
        format: "esm",
        inlineDynamicImports: true, // Cloudflare workers prefer a single bundle usually
      },
    },
    minify: "terser", // Minify to save size
    target: "esnext",
    emptyOutDir: true,
    copyPublicDir: false,
  },
  ssr: {
    noExternal: true, // Bundle everything
    target: "webworker",
  },
});
