import { query, tx } from '../../helpers/api'

import { acala } from '../../networks/acala'
import { hydraDX } from '../../networks/hydraDX'
import { statemint } from '../../networks/statemint'
import { Context } from '../../networks/types'

import buildTest from './shared'

const tests = [
  // statemint <-> acala
  {
    // TODO: this failed to execute on statemint with FailedToTransactAsset error
    from: 'statemint',
    to: 'acala',
    reserve: 'polkadot',
    name: 'DOT',
    test: {
      xcmPalletHorzontal: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(statemint.dot, 1e10, tx.xcmPallet.parachainV2(1, acala.paraId)),
        fromBalance: query.balances,
        toBalance: query.tokens(acala.dot),
        checkUmp: true,
      },
    },
  },
  {
    // TODO: this failed to execute on statemint with WeightNotComputable error
    from: 'acala',
    to: 'statemint',
    reserve: 'polkadot',
    name: 'DOT',
    test: {
      xtokenstHorzontal: {
        tx: tx.xtokens.transferV2(acala.dot, 1e12, tx.xtokens.parachainV2(statemint.paraId)),
        fromBalance: query.tokens(acala.dot),
        toBalance: query.balances,
        checkUmp: true,
      },
    },
  },
  // acala <-> hydraDX
  {
    from: 'acala',
    to: 'hydraDX',
    name: 'DAI',
    fromStorage: {
      Evm: {
        accountStorages: [
          [
            [
              acala.dai.Erc20,
              '0x2aef47e62c966f0695d5af370ddc1bc7c56902063eee60853e2872fc0ff4f88c', // balanceOf(Alice)
            ],
            '0x0000000000000000000000000000000000000000000000056bc75e2d63100000', // 1e20
          ],
        ],
      },
    },
    test: {
      xtokenstHorzontal: {
        tx: tx.xtokens.transferV2(acala.dai, 10n ** 18n, tx.xtokens.parachainV2(hydraDX.paraId)),
        fromBalance: query.evm(acala.dai.Erc20, '0x2aef47e62c966f0695d5af370ddc1bc7c56902063eee60853e2872fc0ff4f88c'),
        toBalance: query.tokens(hydraDX.dai),
      },
    },
  },
  {
    from: 'hydraDX',
    to: 'acala',
    name: 'DAI',
    fromStorage: ({ alice }: Context) => ({
      Tokens: {
        accounts: [[[alice.address, hydraDX.dai], { free: 10n * 10n ** 18n }]],
      },
    }),
    test: {
      xtokenstHorzontal: {
        tx: tx.xtokens.transferV2(hydraDX.dai, 10n ** 18n, tx.xtokens.parachainV2(acala.paraId), 5e9),
        fromBalance: query.tokens(hydraDX.dai),
        toBalance: query.evm(acala.dai.Erc20, '0x2aef47e62c966f0695d5af370ddc1bc7c56902063eee60853e2872fc0ff4f88c'),
      },
    },
  },
] as const

export type TestType = (typeof tests)[number]

buildTest(tests)
