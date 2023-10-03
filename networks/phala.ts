import { Config } from './types'

export type Vars = {
  aUSDToken: string
}

export default {
  polkadot: {
    name: 'phala' as const,
    endpoint: 'wss://phala-rpc.dwellir.com',
    aUSDToken: '3',
  },
  kusama: {
    name: 'khala' as const,
    endpoint: 'wss://khala-rpc.dwellir.com',
    aUSDToken: '4',
  },
  config: ({ alice, aUSDToken }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { providers: 1, data: { free: '1000000000000000' } }]],
      },
      Assets: {
        account: [[[aUSDToken, alice.address], { balance: 100 * 1e12 }]],
      },
    },
  }),
} satisfies Config<Vars>

export const phala = {
  paraId: 2035,
}

export const khala = {
  paraId: 2004,
}
