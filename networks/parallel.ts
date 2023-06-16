import { Config } from './types'

export type Vars = {
  ausd: number
}

export default {
  polkadot: {
    name: 'parallel' as const,
    endpoint: 'wss://rpc.parallel.fi',
    ausd: 104,
  },
  kusama: {
    name: 'heiko' as const,
    endpoint: 'wss://heiko-rpc.parallel.fi',
    ausd: 103,
  },
  config: ({ alice, ausd }) => ({
    storages: {
      System: {
        account: [[[alice.address], { data: { free: 1000 * 1e12 } }]],
      },
      Assets: {
        account: [[[ausd, alice.address], { balance: 100 * 1e12 }]],
      },
    },
  }),
} satisfies Config<Vars>

export const parallel = {
  paraId: 2012,
}

export const heiko = {
  paraId: 2085,
}
