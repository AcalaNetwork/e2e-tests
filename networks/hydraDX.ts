import { Config } from './types'

export type Vars = {
  relayToken: number
}

export default {
  polkadot: {
    name: 'hydraDX' as const,
    endpoint: 'wss://rpc.hydradx.cloud',
    relayToken: 5
  },
  kusama: {
    name: 'basilisk' as const,
    endpoint: 'wss://rpc.basilisk.cloud',
    relayToken: 1
  },
  config: ({ alice, relayToken }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e12 } }]],
      },
      Tokens: {
        Accounts: [[[alice.address, relayToken], { free: 1000 * 1e12 } ]],
      },
    },
  }),
} satisfies Config<Vars>

export const hydraDX = {
  paraId: 2034,
  dai: 2,
}

export const basilisk = {
  paraId: 2090,
  dai: 13,
}
