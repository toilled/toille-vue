/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { sharedPlugins } from './vite.plugins';

export default defineConfig({
  plugins: [vue(), ...sharedPlugins()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './src/tests/setupThree.ts',
      './src/tests/setupHead.ts',
      './src/tests/setupI18n.ts',
    ],
    testTimeout: 20000,
    maxConcurrency: 4,
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
