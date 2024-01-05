import { expect } from 'bun:test'

import { withExpect } from '@acala-network/chopsticks-testing'

const { check, checkEvents, checkHrmp, checkSystemEvents, checkUmp } = withExpect((x: any) => ({
  toMatchSnapshot(msg?: string): void {
    expect(x).toMatchSnapshot(msg as any) // as any required to workaround https://github.com/oven-sh/bun/issues/7786
  },
  toMatch(value: any, _msg?: string): void {
    expect(x).toMatch(value)
  },
  toMatchObject(value: any, _msg?: string): void {
    expect(x).toMatchObject(value)
  },
}))

export { check, checkEvents, checkHrmp, checkSystemEvents, checkUmp }

export * from '@acala-network/chopsticks-testing'

const defaultTimeout = process.env.CI ? 180000 : 120000

export const jest = (filename: string) => {
  const { beforeEach, afterEach, afterAll, expect, describe, it } = (Bun as any).jest(filename) // workaround https://github.com/oven-sh/bun/issues/7873

  const newIt = (name: string, fn: any, timeout = defaultTimeout) => {
    it(
      name,
      async () => {
        await fn()
      },
      timeout,
    )
  }

  return { beforeEach, afterEach, afterAll, expect, describe, it: newIt }
}
