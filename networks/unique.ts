import { Config } from './types'

export default {
  polkadot: {
    name: 'unique' as const,
    endpoint: 'wss://ws.unique.network',
  },
  kusama: {
    name: 'quartz' as const,
    endpoint: 'wss://ws-quartz.unique.network',
  },
  config: ({ alice }) => ({
    storages: {
      System: {
        account: [[[alice.address], { data: { free: 1000 * 1e12 } }]],
      },
    },
  }),
} satisfies Config

export const unique = {
  paraId: 2037,
}

export const quartz = {
  paraId: 2095,
}
