// https://nuxt.com/docs/api/configuration/nuxt-config
import viteCompression from 'vite-plugin-compression';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [],
  css: [
    '~/assets/pico.min.css',
    '~/assets/main.css'
  ],
  vite: {
    plugins: [
      viteCompression(),
      viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    ],
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
  },
  ssr: true,
  nitro: {
    preset: 'cloudflare-pages',
  }
})
