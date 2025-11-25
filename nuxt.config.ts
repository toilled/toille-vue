export default defineNuxtConfig({
  ssr: false,
  app: {
    head: {
      title: 'Elliot Dickerson',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'The experimental website of Elliot Dickerson made in Vue.' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  css: [
    '@picocss/pico/css/pico.min.css',
    '~/assets/css/index.css'
  ]
})
