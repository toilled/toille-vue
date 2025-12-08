export default defineNuxtConfig({
    compatibilityDate: '2025-12-08',
    devtools: { enabled: true },
    modules: [],
    nitro: {
        preset: 'cloudflare-pages'
    },
    app: {
        head: {
            title: 'Elliot Dickerson',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' }
            ]
        }
    }
})
