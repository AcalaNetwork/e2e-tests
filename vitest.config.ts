import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    hookTimeout: process.env.CI ? 60000 : 300000000,
    testTimeout: process.env.CI ? 300000 : 300000000,
    maxThreads: process.env.CI ? 1 : undefined,
    minThreads: process.env.CI ? 1 : undefined,
  },
})
