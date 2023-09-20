import { Config } from './types'

export type Vars = {
  relayToken: number
  dai: number
}

export default {
  polkadot: {
    name: 'hydraDX' as const,
    endpoint: 'wss://rpc.hydradx.cloud',
    relayToken: 5,
    dai: 2,
  },
  kusama: {
    name: 'basilisk' as const,
    endpoint: 'wss://basilisk-rpc.dwellir.com',
    relayToken: 1,
    dai: 13,
  },
  config: ({ alice, relayToken, dai }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e12 } }]],
      },
      Tokens: {
        Accounts: [
          [[alice.address, relayToken], { free: 1000 * 1e12 }],
          [[alice.address, dai], { free: 100n * 10n ** 18n }],
        ],
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
