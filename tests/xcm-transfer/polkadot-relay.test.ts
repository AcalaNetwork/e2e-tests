import { query, tx } from '../../helpers/api'

import { acala } from '../../networks/acala'
import { astar } from '../../networks/astar'
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
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(polkadot.dot, 1e12, tx.xcmPallet.parachainV3(0, acala.paraId)),
        balance: query.tokens(acala.dot),
      },
    },
  },
  // acala2180 <-> polkadot
  {
    from: 'acala2180',
    to: 'polkadot',
    name: 'DOT',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transfer(acala.dot, 1e12, tx.xtokens.relaychainV3),
        balance: query.tokens(acala.dot),
      },
    },
  },
  {
    from: 'polkadot',
    to: 'acala2180',
    name: 'DOT',
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(polkadot.dot, 1e12, tx.xcmPallet.parachainV3(0, acala.paraId)),
        balance: query.tokens(acala.dot),
      },
    },
  },
  // polkadot <-> astar
  {
    from: 'polkadot',
    to: 'astar',
    name: 'DOT',
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(polkadot.dot, 1e12, tx.xcmPallet.parachainV3(0, astar.paraId)),
        balance: query.assets(astar.dot),
      },
    },
  },
] as const

export type TestType = (typeof tests)[number]

buildTest(tests)
