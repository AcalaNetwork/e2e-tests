import { query, tx } from '../../helpers/api'

import { acala } from '../../networks/acala'
import { statemint } from '../../networks/statemint'

import buildTest from './shared'

const tests = [
  // statemint <-> acala
  {
    from: 'statemint',
    to: 'acala',
    reserve: 'polkadot',
    name: 'DOT',
    test: {
      xcmPalletHorzontal: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(statemint.dot, 1e12, tx.xcmPallet.parachainV2(1, 2000)),
        fromBalance: query.balances,
        toBalance: query.tokens(acala.dot),
        checkUmp: true,
      },
    },
  },
  {
    from: 'acala',
    to: 'statemint',
    reserve: 'polkadot',
    name: 'DOT',
    test: {
      xtokenstHorzontal: {
        tx: tx.xtokens.transferV2(acala.dot, 1e12, tx.xtokens.parachainV2(1000)),
        fromBalance: query.tokens(acala.dot),
        toBalance: query.balances,
        checkUmp: true,
      },
    },
  },
] as const

export type TestType = (typeof tests)[number]

buildTest(tests)
