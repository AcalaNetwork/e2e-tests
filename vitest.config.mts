import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		hookTimeout: process.env.CI ? 60_000 : 120_000,
		testTimeout: process.env.CI ? 300_000 : 600_000,
	},
})
