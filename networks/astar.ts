import { Config } from './types'

export type Vars = {
  relayToken: string
}

export default {
  polkadot: {
    name: 'astar' as const,
    endpoint: 'wss://rpc.astar.network',
    relayToken: 'DOT',
  },
  kusama: {
    name: 'shiden' as const,
    endpoint: 'wss://rpc.shiden.astar.network',
    relayToken: 'KSM',
  },
  config: ({ alice, relayToken }) => ({
    storages: {
      System: {
        account: [[[alice.address], { data: { free: 10 * 1e18 } }]],
      },
      Tokens: {
        accounts: [
          [[alice.address, { Token: relayToken }], { free: 10 * 1e12 }],
        ],
      },
      Sudo: {
        key: alice.address,
      },
      PolkadotXcm: {
        // avoid sending xcm version change notifications to makes things faster
        $removePrefix: ['versionNotifyTargets', 'versionNotifiers', 'supportedVersion'],
      },
    },
  }),
} satisfies Config<Vars>

export const astar = {
  paraId: 2006,
  paraAccount: '13YMK2eZzuFY1WZGagpYtTgbWBWGdoUD2CtrPj1mQPjY8Ldc',
  dot: { assetId: '340282366920938463463374607431768211455' },
  astr: { assetId: '0000000000000000000' },
  aca: { assetId: '18446744073709551616' },
} as const

export const shiden = {
  paraId: 2007,
  paraAccount: 'F7fq1jNy74AqkJ1DP4KqSrWtnTGtXfNVoDwFhTvvPxUvJaq',
  ksm: { assetId: '340282366920938463463374607431768211455' },
  sdn: { assetId: '0000000000000000000' },
  kar: { assetId: '18446744073709551618' },
} as const
