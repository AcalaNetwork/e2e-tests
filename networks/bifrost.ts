import { Config } from './types'

export default {
  polkadot: {
    name: 'bifrostPolkadot' as const,
    endpoint: 'wss://hk.p.bifrost-rpc.liebi.com/ws',
  },
  kusama: {
    name: 'bifrost' as const,
    endpoint: 'wss://bifrost-rpc.dwellir.com',
  },
  config: ({ alice }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { providers: 1, data: { free: 1000e12 } }]],
      },
    },
  }),
} satisfies Config

export const basilisk = {
  paraId: 2001,
}
export const bifrostPolkadot = {
  paraId: 2030,
}
