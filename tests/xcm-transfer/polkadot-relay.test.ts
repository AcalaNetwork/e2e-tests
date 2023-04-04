import { query, tx } from '../../helpers/api'

import { acala } from '../../networks/acala'
import { polkadot } from '../../networks/polkadot'

import buildTest from './shared'

const tests = [
  // acala <-> polkadot
  {
    from: 'acala',
    to: 'polkadot',
    name: 'DOT',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transfer(acala.dot, 1e12, tx.xtokens.relaychainV2),
        balance: query.tokens(acala.dot),
      },
    },
  },
  {
    from: 'polkadot',
    to: 'acala',
    name: 'DOT',
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(polkadot.dot, 1e12, tx.xcmPallet.parachainV2(0, acala.paraId)),
        balance: query.tokens(acala.dot),
      },
    },
  },
  // acala <-> polkadot9381
  {
    from: 'acala',
    to: 'polkadot9381',
    name: 'DOT',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transfer(acala.dot, 1e12, tx.xtokens.relaychainV2),
        balance: query.tokens(acala.dot),
      },
    },
  },
  {
    from: 'polkadot9381',
    to: 'acala',
    name: 'DOT',
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(polkadot.dot, 1e12, tx.xcmPallet.parachainV3(0, acala.paraId)),
        balance: query.tokens(acala.dot),
      },
    },
  },
] as const

export type TestType = (typeof tests)[number]

buildTest(tests)
