import { query, tx } from '../../helpers/api'

import { karura } from '../../networks/acala'
import { kusama } from '../../networks/polkadot'

import buildTest from './shared'

const tests = [
  // karura <-> kusama
  {
    from: 'karura',
    to: 'kusama',
    name: 'KSM',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transferV2(karura.ksm, 1e12, tx.xtokens.relaychainV2),
        balance: query.tokens(karura.ksm),
      },
    },
  },
  {
    from: 'kusama',
    to: 'karura',
    name: 'KSM',
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(kusama.ksm, 1e12, tx.xcmPallet.parachainV2(0, 2000)),
        balance: query.tokens(karura.ksm),
      },
    },
  },
  // karura <-> kusama9381
  {
    from: 'karura',
    to: 'kusama9381',
    name: 'KSM',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transferV2(karura.ksm, 1e12, tx.xtokens.relaychainV2),
        balance: query.tokens(karura.ksm),
      },
    },
  },
  {
    from: 'kusama9381',
    to: 'karura',
    name: 'KSM',
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(kusama.ksm, 1e12, tx.xcmPallet.parachainV3(2000)),
        balance: query.tokens(karura.ksm),
      },
    },
  },
] as const

export type TestType = (typeof tests)[number]

buildTest(tests)
