import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    restoreMocks: true,
    // Las specs de Playwright viven en `e2e/` y corren con su propio runner.
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
})
