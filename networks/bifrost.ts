import { Config } from './types'

export default {
  kusama: {
    name: 'bifrost' as const,
    endpoint: 'wss://bifrost-rpc.dwellir.com',
  },
  polkadot: {
    name: 'bifrostPolkadot' as const,
    endpoint: 'wss://hk.p.bifrost-rpc.liebi.com/ws',
  },
  config: ({ alice }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e12 } }]],
      },
    },
  }),
} satisfies Config


export const basilisk = {
  paraId: 2001
}
export const bifrostPolkadot = {
  paraId: 2030
}
