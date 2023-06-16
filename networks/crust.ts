import { Config } from './types'

export default {
  polkadot: {
    name: 'crust' as const,
    endpoint: 'wss://rpc-shadow.crust.network/',
  },
  kusama: {
    name: 'crustPolkadot' as const,
    endpoint: 'wss://crust-parachain.crustapps.net',
  },
  config: ({ alice }) => ({
    storages: {
      System: {
        account: [[[alice.address], { data: { free: 1000 * 1e12 } }]],
      },
    },
  }),
} satisfies Config

export const crust = {
  paraId: 2012,
}

export const crustPolkadot = {
  paraId: 2008,
}
