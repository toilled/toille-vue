import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import cloudflare from '@astrojs/cloudflare';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';

const isAdapterEnabled = process.argv.some(a => a === 'build');

export default defineConfig({
  output: 'server',
  adapter: isAdapterEnabled
    ? cloudflare({ mode: 'directory', imageService: 'passthrough' })
    : undefined,
  integrations: [vue()],
  vite: {
    ssr: {
      noExternal: ['three'],
    },
    plugins: [
      AutoImport({
        imports: ['vue', 'vue-router'],
        dts: true,
      }),
      Components({
        dirs: ['src/components'],
        extensions: ['vue'],
        dts: true,
        exclude: [
          '**/CyberpunkCity.vue',
          '**/Checker.vue',
          '**/Activity.vue',
          '**/Suggestion.vue',
        ],
      }),
    ],
  },
});
