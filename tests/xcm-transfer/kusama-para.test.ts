import { Context } from '../../networks/types'
import { query, tx } from '../../helpers/api'

import { basilisk } from '../../networks/hydraDX'
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
      xcmPalletHorizontal: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(
          statemine.usdt,
          1e6,
          tx.xcmPallet.parachainV3(1, karura.paraId)
        ),
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
      xtokenstHorizontal: {
        tx: tx.xtokens.transfer(karura.usdt, 1e6, tx.xtokens.parachainV2(statemine.paraId)),
        fromBalance: query.tokens(karura.usdt),
        toBalance: query.assets(statemine.usdtIndex),
      },
    },
  },
  // karura <-> basilisk
  {
    from: 'karura',
    to: 'basilisk',
    name: 'DAI',
    fromStorage: {
      Evm: {
        accountStorages: [
          [
            [
              karura.dai.Erc20,
              '0x2aef47e62c966f0695d5af370ddc1bc7c56902063eee60853e2872fc0ff4f88c', // balanceOf(Alice)
            ],
            '0x0000000000000000000000000000000000000000000000056bc75e2d63100000', // 1e20
          ],
        ],
      },
    },
    test: {
      xtokenstHorizontal: {
        tx: tx.xtokens.transfer(karura.dai, 10n ** 18n, tx.xtokens.parachainV2(basilisk.paraId)),
        fromBalance: query.evm(karura.dai.Erc20, '0x2aef47e62c966f0695d5af370ddc1bc7c56902063eee60853e2872fc0ff4f88c'),
        toBalance: query.tokens(basilisk.dai),
      },
    },
  },
  {
    from: 'basilisk',
    to: 'karura',
    name: 'DAI',
    fromStorage: ({ alice }: Context) => ({
      Tokens: {
        accounts: [[[alice.address, basilisk.dai], { free: 10n * 10n ** 18n }]],
      },
    }),
    test: {
      xtokenstHorizontal: {
        tx: tx.xtokens.transfer(basilisk.dai, 10n ** 18n, tx.xtokens.parachainV2(karura.paraId), 5e9),
        fromBalance: query.tokens(basilisk.dai),
        toBalance: query.evm(karura.dai.Erc20, '0x2aef47e62c966f0695d5af370ddc1bc7c56902063eee60853e2872fc0ff4f88c'),
      },
    },
  },
] as const

export type TestType = (typeof tests)[number]

buildTest(tests)
