import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'

export default defineConfig({
	test: {
		hookTimeout: 240_000,
		testTimeout: 240_000,
		pool: 'forks',
		passWithNoTests: true,
		retry: process.env.CI ? 3 : 2,
		reporters: process.env.GITHUB_ACTIONS ? ['basic', 'github-actions'] : ['basic'],
	},
	plugins: [swc.vite()],
})
