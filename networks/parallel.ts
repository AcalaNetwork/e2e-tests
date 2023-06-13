import { Config } from './types'

export type Vars = {
  relayToken: string
}

export default {
  polkadot: {
    name: 'parallel' as const,
    relayToken: '104',
    endpoint: 'wss://rpc.parallel.fi',
  },
  kusama: {
    name: 'heiko' as const,
    relayToken: '103',
    endpoint: 'wss://parallel-heiko.api.onfinality.io/public-ws',
  },
  config: ({ alice, relayToken }) => ({
    storages: {
      System: {
        account: [[[alice.address], { data: { free: 1000 * 1e12 } }]],
      },
      Assets: {
        account: [[[relayToken, alice.address], { balance: 100 * 1e12 }]],
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


