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
        accounts: [[[alice.address, { Token: relayToken }], { free: 10 * 1e12 }]],
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
  dot: { Concrete: { parents: 1, interior: 'Here' } },
  astr: { Concrete: { parents: 0, interior: 'Here' } },
  aca: { parents: 1, interior: { X2: [{ Parachain: 2000 }, { GeneralKey: 0x0000 }] } },
  usdt: { parents: 1, interior: { X3: [{ Parachain: 1000 }, { PalletInstance: 50 }, { GeneralIndex: 1984 }] } },
} as const

export const shiden = {
  paraId: 2007,
  paraAccount: 'F7fq1jNy74AqkJ1DP4KqSrWtnTGtXfNVoDwFhTvvPxUvJaq',
  ksm: { Concrete: { parents: 1, interior: 'Here' } },
  sdn: { Concrete: { parents: 0, interior: 'Here' } },
  kar: { parents: 1, interior: { X2: [{ Parachain: 2000 }, { GeneralKey: 0x0000 }] } },
  usdt: { parents: 1, interior: { X3: [{ Parachain: 1000 }, { PalletInstance: 50 }, { GeneralIndex: 1984 }] } },
} as const
