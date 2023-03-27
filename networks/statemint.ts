import { Config } from './types'

export default {
  polkadot: {
    name: 'statemint' as const,
    endpoint: 'wss://statemint-rpc.polkadot.io',
  },
  kusama: {
    name: 'statemine' as const,
    endpoint: 'wss://statemine-rpc.polkadot.io',
  },
  config: ({ alice }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e10 } }]],
      },
      Assets: {
        Account: [[[1984, alice.address], { balance: 1000e6 }]], // USDT
      },
    },
  }),
} satisfies Config
