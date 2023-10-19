import { Config } from './types'

export default {
  polkadot: {
    name: 'darwinia' as const,
    endpoint: 'wss://darwinia-rpc.dwellir.com',
  },
  kusama: {
    name: 'crab' as const,
    endpoint: 'wss://crab-rpc.darwinia.network',
  },
  config: ({ alice }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { providers: 1, data: { free: '1000000000000000000000' } }]],
      },
    },
  }),
} satisfies Config

export const darwinia = {
  paraId: 2046,
}

export const crab = {
  paraId: 2105,
}
