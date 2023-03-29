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
        Account: [[[alice.address], { data: { free: 1000e10 } }]],
      },
      Assets: {
        Account: [
          [[1984, alice.address], { balance: 1000e6 }], // USDT
        ],
      },
    },
  }),
} satisfies Config

export const statemint = {
  paraId: 1000,
  dot: { Concrete: { parents: 0, interior: 'Here' } },
} as const

export const statemine = {
  paraId: 1000,
  ksm: { Concrete: { parents: 0, interior: 'Here' } },
  usdt: { Concrete: { parents: 0, interior: { X2: [{ PalletInstance: 50 }, { GeneralIndex: 1984 }] } } },
  usdtIndex: 1984,
} as const
