import { Config } from './types'

export default {
  polkadot: {
    name: 'bifrostPolkadot' as const,
    endpoint: 'wss://bifrost.public.curie.radiumblock.co/ws',
  },
  kusama: {
    name: 'bifrost' as const,
    endpoint: 'wss://us.bifrost-rpc.liebi.com/ws',
  },
  config: ({ alice }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { providers: 1, data: { free: 1000e12 } }]],
      },
    },
  }),
} satisfies Config

export const bifrost = {
  paraId: 2001,
}
export const bifrostPolkadot = {
  paraId: 2030,
}
