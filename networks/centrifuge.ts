import { Config } from './types'

export default {
  polkadot: {
    name: 'centrifuge' as const,
    endpoint: 'wss://fullnode.centrifuge.io',
  },
  kusama: {
    name: 'altair' as const,
    endpoint: 'wss://fullnode.altair.centrifuge.io',
  },
  config: ({ alice }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { data: { free: '1000000000000000000000' } }]],
      },
      OrmlTokens: {
        accounts: [[[alice.address, 'AUSD'], { free: 10 * 1e12 }]],
      },
    },
  }),
} satisfies Config

export const altair = {
  paraId: 2088,
}

export const basilisk = {
  paraId: 2031,
}
