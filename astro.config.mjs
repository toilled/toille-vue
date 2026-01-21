import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import viteCompression from 'vite-plugin-compression';

// https://astro.build/config
export default defineConfig({
  integrations: [vue()],
  vite: {
    plugins: [
        viteCompression(),
        viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    ],
    build: {
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
  },
});
