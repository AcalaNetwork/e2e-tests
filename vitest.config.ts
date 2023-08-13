import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    hookTimeout: 300000,
    testTimeout: 300000,
    maxThreads: process.env.CI ? 2 : undefined,
  },
})
