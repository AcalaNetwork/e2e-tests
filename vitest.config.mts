import { defineConfig } from 'vitest/config'

const minutes = (n: number) => n * 60 * 1000

export default defineConfig({
	test: {
		hookTimeout: process.env.CI ? minutes(2) : minutes(3),
		testTimeout: process.env.CI ? minutes(5) : minutes(10),
		maxThreads: 8,
		minThreads: 1,
	},
})
