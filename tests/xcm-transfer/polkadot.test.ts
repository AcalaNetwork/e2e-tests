import { beforeEach, describe, it } from 'vitest'
import { sendTransaction } from '@acala-network/chopsticks-testing'

import { Network, createContext, createNetworks } from '../../networks'
import { check, checkEvents, checkHrmp, checkSystemEvents, checkUmp } from '../../helpers'
import { query, tx } from '../../helpers/api'

import { acala } from '../../networks/acala'
import { polkadot } from '../../networks/polkadot'
import { statemint } from '../../networks/statemint'

import buildTest from './shared'

const tests = [
  // acala <-> polkadot
  {
    from: 'acala',
    to: 'polkadot',
    name: 'DOT',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transferV2(acala.dot, 1e12, tx.xtokens.relaychainV2),
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
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(polkadot.dot, 1e12, tx.xcmPallet.parachainV2(0, 2000)),
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
        tx: tx.xtokens.transferV2(acala.dot, 1e12, tx.xtokens.relaychainV2),
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
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(polkadot.dot, 1e12, tx.xcmPallet.parachainV3(2000)),
        balance: query.tokens(acala.dot),
      },
    },
  },
  // statemint <-> acala
  {
    from: 'statemint',
    to: 'acala',
    name: 'WBTC',
    test: {
      xcmPalletHorzontal: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(statemint.wbtc, 1e6, tx.xcmPallet.parachainV2(1, 2000)),
        fromBalance: query.assets(statemint.wbtcIndex),
        toBalance: query.tokens(acala.wbtc),
      },
    },
  },
  {
    from: 'acala',
    to: 'statemint',
    name: 'WBTC',
    test: {
      xtokenstHorzontal: {
        tx: tx.xtokens.transferV2(acala.wbtc, 1e6, tx.xtokens.parachainV2(1000)),
        fromBalance: query.tokens(acala.wbtc),
        toBalance: query.assets(statemint.wbtcIndex),
      },
    },
  },
] as const

export type TestType = (typeof tests)[number]

buildTest(tests)
