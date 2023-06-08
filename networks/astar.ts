import { Config } from './types'

export type Vars = {
  relayToken: string
}

export default {
  polkadot: {
    name: 'astar' as const,
    endpoint: 'wss://astar.api.onfinality.io/public-ws',
    relayToken: '340282366920938463463374607431768211455',
  },
  kusama: {
    name: 'shiden' as const,
    endpoint: 'wss://shiden.api.onfinality.io/public-ws',
    relayToken: '340282366920938463463374607431768211455',
  },
  config: ({ alice, relayToken }) => ({
    storages: {
      System: {
        account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
      Assets: {
        account: [[[relayToken, alice.address], { balance: 10 * 1e12 }]],
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
  dot: 340282366920938463463374607431768211455n,
  astr: { Concrete: { parents: 0, interior: 'Here' } },
  aca: 18446744073709551616n,
  usdt: 4294969280n,
} as const

export const shiden = {
  paraId: 2007,
  paraAccount: 'F7fq1jNy74AqkJ1DP4KqSrWtnTGtXfNVoDwFhTvvPxUvJaq',
  ksm: 340282366920938463463374607431768211455n,
  sdn: { Concrete: { parents: 0, interior: 'Here' } },
  kar: 18446744073709551618n,
  usdt: 4294969280n,
} as const
