import { Config } from './types'

export default {
  polkadot: {
    name: 'polkadot' as const,
    endpoint: 'wss://rpc.polkadot.io',
  },
  kusama: {
    name: 'kusama' as const,
    endpoint: 'wss://kusama-rpc.polkadot.io',
  },
  config: ({ alice }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
      ParasDisputes: {
        // those can makes block building super slow
        $removePrefix: ['disputes'],
      },
    },
  }),
} satisfies Config
