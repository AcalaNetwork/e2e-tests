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
