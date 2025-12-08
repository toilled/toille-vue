import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'happy-dom',
        globals: true,
        include: ['components/tests/*.spec.ts'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
            '~': path.resolve(__dirname, '.'),
        },
    },
})
