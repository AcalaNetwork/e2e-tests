import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		hookTimeout: 200_000,
		testTimeout: 600_000,
	},
})
