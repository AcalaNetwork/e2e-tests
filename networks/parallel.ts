import { Config } from './types'

export type Vars = {
  ausd: number
  acalaNativeToken: number
}

export default {
  polkadot: {
    name: 'parallel' as const,
    endpoint: 'wss://rpc.parallel.fi',
    ausd: 104,
    acalaNativeToken: 108,
  },
  kusama: {
    name: 'heiko' as const,
    endpoint: 'wss://heiko-rpc.parallel.fi',
    ausd: 103,
    acalaNativeToken: 107,
  },
  config: ({ alice, ausd, acalaNativeToken }) => ({
    storages: {
      System: {
        account: [[[alice.address], { data: { free: 1000 * 1e12 } }]],
      },
      Assets: {
        account: [
          [[acalaNativeToken, alice.address], { balance: 100 * 1e12 }],
          [[ausd, alice.address], { balance: 100 * 1e12 }],
        ],
      },
    },
  }),
} satisfies Config<Vars>

export const parallel = {
  paraId: 2012,
}

export const heiko = {
  paraId: 2085,
}
