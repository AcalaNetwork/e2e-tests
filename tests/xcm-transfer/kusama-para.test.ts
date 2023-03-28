import { Context } from '../../networks/types'
import { query, tx } from '../../helpers/api'

import { karura } from '../../networks/acala'
import { statemine } from '../../networks/statemint'

import buildTest from './shared'

const tests = [
  // statemine <-> karura
  {
    from: 'statemine',
    to: 'karura',
    name: 'USDT',
    test: {
      xcmPalletHorzontal: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(statemine.usdt, 1e6, tx.xcmPallet.parachainV2(1, karura.paraId)),
        fromBalance: query.assets(statemine.usdtIndex),
        toBalance: query.tokens(karura.usdt),
      },
    },
  },
  {
    from: 'karura',
    to: 'statemine',
    name: 'USDT',
    fromStorage: ({ alice }: Context) => ({
      Tokens: {
        Accounts: [[[alice.address, karura.usdt], { free: 10e6 }]],
      },
    }),
    test: {
      xtokenstHorzontal: {
        tx: tx.xtokens.transferV2(karura.usdt, 1e6, tx.xtokens.parachainV2(statemine.paraId)),
        fromBalance: query.tokens(karura.usdt),
        toBalance: query.assets(statemine.usdtIndex),
      },
    },
  },
] as const

export type TestType = (typeof tests)[number]

buildTest(tests)
