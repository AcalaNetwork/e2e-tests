import { beforeEach, describe, it } from 'vitest'
import { sendTransaction } from '@acala-network/chopsticks-testing'

import { Network, createContext, createNetworks } from '../../networks'
import { check, checkEvents, checkHrmp, checkSystemEvents, checkUmp } from '../../helpers'
import { query, tx } from '../../helpers/api'

import { karura } from '../../networks/acala'
import { kusama } from '../../networks/polkadot'
import { statemine } from '../../networks/statemint'

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
  // statemine <-> karura
  {
    from: 'statemine',
    to: 'karura',
    name: 'USDT',
    test: {
      xcmPalletHorzontal: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(statemine.usdt, 1e6, tx.xcmPallet.parachainV2(1, 2000)),
        fromBalance: query.assets(statemine.usdtIndex),
        toBalance: query.tokens(karura.usdt),
      },
    },
  },
  {
    from: 'karura',
    to: 'statemine',
    name: 'USDT',
    test: {
      xtokenstHorzontal: {
        tx: tx.xtokens.transferV2(karura.usdt, 1e6, tx.xtokens.parachainV2(1000)),
        fromBalance: query.tokens(karura.usdt),
        toBalance: query.assets(statemine.usdtIndex),
      },
    },
  },
] as const

export type TestType = (typeof tests)[number]

buildTest(tests)
