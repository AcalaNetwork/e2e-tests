import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'

export default defineConfig({
	test: {
		hookTimeout: 180_000,
		testTimeout: 240_000,
		pool: 'forks',
		passWithNoTests: true,
	},
	plugins: [swc.vite()],
})
