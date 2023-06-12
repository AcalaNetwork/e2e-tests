import { Config } from './types'

export default {
  polkadot: {
    name: 'parallel' as const,
    endpoint: 'wss://rpc.parallel.fi',
  },
  kusama: {
    name: 'heiko' as const,
    endpoint: 'wss://parallel-heiko.api.onfinality.io/public-ws',
  },
  config: ({ alice }) => ({
    storages: {
      System: {
        account: [[[alice.address], { providers: 1, data: { free: 1000 * 1e12 } }]],
      },
      Assets: {
        account: [
          [[heiko.ausd, alice.address], { balance: 100 * 1e12 }], // AUSD
        ],
      },
    },
  }),
} satisfies Config

export const parallel = {
  paraId: 2012,
  ausd: 104,
}

export const heiko = {
  paraId: 2085,
  ausd: 103,
}
