import { Context } from '../../networks/types'
import { query, tx } from '../../helpers/api'

import { assetHubKusama } from '../../networks/assetHub'
import { basilisk } from '../../networks/hydraDX'
import { karura } from '../../networks/acala'

import buildTest from './shared'

const tests = [
  // assetHubKusama <-> karura
  {
    from: 'assetHubKusama',
    to: 'karura',
    name: 'USDT',
    test: {
      xcmPalletHorizontal: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(
          assetHubKusama.usdt,
          1e6,
          tx.xcmPallet.parachainV3(1, karura.paraId),
        ),
        fromBalance: query.assets(assetHubKusama.usdtIndex),
        toBalance: query.tokens(karura.usdt),
      },
    },
  },
  {
    from: 'karura',
    to: 'assetHubKusama',
    name: 'USDT',
    fromStorage: ({ alice }: Context) => ({
      Tokens: {
        Accounts: [[[alice.address, karura.usdt], { free: 10e6 }]],
      },
    }),
    test: {
      xtokenstHorizontal: {
        tx: tx.xtokens.transfer(karura.usdt, 1e6, tx.xtokens.parachainV3(assetHubKusama.paraId)),
        fromBalance: query.tokens(karura.usdt),
        toBalance: query.assets(assetHubKusama.usdtIndex),
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
        tx: tx.xtokens.transfer(karura.dai, 10n ** 18n, tx.xtokens.parachainV3(basilisk.paraId)),
        fromBalance: query.evm(karura.dai.Erc20, '0x2aef47e62c966f0695d5af370ddc1bc7c56902063eee60853e2872fc0ff4f88c'),
        toBalance: query.tokens(basilisk.dai),
      },
    },
  },
  // TODO: restore this once Basilisk fixed the asset mapping issue
  // {
  //   from: 'basilisk',
  //   to: 'karura',
  //   name: 'DAI',
  //   fromStorage: ({ alice }: Context) => ({
  //     Tokens: {
  //       accounts: [[[alice.address, basilisk.dai], { free: 10n * 10n ** 18n }]],
  //     },
  //   }),
  //   test: {
  //     xtokenstHorizontal: {
  //       tx: tx.xtokens.transfer(basilisk.dai, 10n ** 18n, tx.xtokens.parachainV3(karura.paraId)),
  //       fromBalance: query.tokens(basilisk.dai),
  //       toBalance: query.evm(karura.dai.Erc20, '0x2aef47e62c966f0695d5af370ddc1bc7c56902063eee60853e2872fc0ff4f88c'),
  //     },
  //   },
  // },
] as const

export type TestType = (typeof tests)[number]

buildTest(tests)
