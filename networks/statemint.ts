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
          [[21, alice.address], { balance: 10e8 }], // WBTC
          [[1984, alice.address], { balance: 1000e6 }], // USDT
        ],
      },
    },
  }),
} satisfies Config

export const statemint = {
  dot: { Concrete: { parents: 0, interior: 'Here' } },
  wbtc: { Concrete: { parents: 0, interior: { X2: [{ PalletInstance: 50 }, { GeneralIndex: 21 }] } } },
  wbtcIndex: 21,
}

export const statemine = {
  ksm: { Concrete: { parents: 0, interior: 'Here' } },
  usdt: { Concrete: { parents: 0, interior: { X2: [{ PalletInstance: 50 }, { GeneralIndex: 1984 }] } } },
  usdtIndex: 1984,
}
