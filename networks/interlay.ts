import { Config } from './types'
export type Vars = {
  btc: string
  native: string
  LiquidToken: number
}

export default {
  polkadot: {
    name: 'interlay' as const,
    endpoint: 'wss://interlay-rpc.dwellir.com',
    btc: 'IBTC',
    native: 'INTR',
    LiquidToken: 1,
  },
  kusama: {
    name: 'kintsugi' as const,
    endpoint: 'wss://api-kusama.interlay.io/parachain',
    btc: 'KBTC',
    native: 'KINT',
    LiquidToken: 2,
  },
  config: ({ alice, btc, native, LiquidToken }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e12 } }]],
      },
      Tokens: {
        Accounts: [
          [[alice.address, { ForeignAsset: LiquidToken }], { free: 100 * 1e12 }],
          [[alice.address, { Token: native }], { free: 1000 * 1e12 }],
          [[alice.address, { Token: btc }], { free: 3 * 1e8 }],
        ],
      },
    },
  }),
} satisfies Config<Vars>

export const interlay = {
  paraId: 2032,
}

export const kintsugi = {
  paraId: 2092,
}
