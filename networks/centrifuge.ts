import { Config } from './types'

export default {
  polkadot: {
    name: 'centrifuge' as const,
    endpoint: 'wss://centrifuge-parachain.api.onfinality.io/public-ws',
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
    },
  }),
} satisfies Config

export const altair = {
  paraId: 2088,
}

export const basilisk = {
  paraId: 2031,
}
