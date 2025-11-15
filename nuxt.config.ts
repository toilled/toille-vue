export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@picocss/pico/css/pico.min.css', '~/assets/main.css'],
  hooks: {
    async 'nitro:config'(nitroConfig) {
      const pages = await import('./pages.json').then(m => m.default)
      nitroConfig.prerender.routes = pages.map(page => page.link)
    }
  }
})
