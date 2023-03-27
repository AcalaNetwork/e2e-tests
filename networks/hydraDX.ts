import { Config } from './types'

export default {
  polkadot: {
    name: 'hydraDX' as const,
    endpoint: 'wss://rpc.hydradx.cloud',
  },
  kusama: {
    name: 'basilisk' as const,
    endpoint: 'wss://rpc.basilisk.cloud',
  },
  config: ({ alice }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e12 } }]],
      },
    },
  }),
} satisfies Config
