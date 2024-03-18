import { Context } from '../../networks/types'
import { query, tx } from '../../helpers/api'

import { acala } from '../../networks/acala'
import { assetHubPolkadot } from '../../networks/assetHub'
import { hydraDX } from '../../networks/hydraDX'
import { moonbeam } from '../../networks/moonbeam'

import buildTest from './shared'

const tests = [
  // assetHubPolkadot <-> acala
  {
    from: 'assetHubPolkadot',
    to: 'acala',
    name: 'WBTC',
    fromStorage: ({ alice }: Context) => ({
      System: {
        account: [[[acala.paraAccount], { providers: 1, data: { free: 10e10 } }]],
      },
      Assets: {
        account: [[[assetHubPolkadot.wbtcIndex, alice.address], { balance: 1e8 }]],
        asset: [[[assetHubPolkadot.wbtcIndex], { supply: 1e8 }]],
      },
    }),
    test: {
      xcmPalletHorizontal: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(assetHubPolkadot.wbtc, 1e7, tx.xcmPallet.parachainV3(1, acala.paraId)),
        fromBalance: query.assets(assetHubPolkadot.wbtcIndex),
        toBalance: query.tokens(acala.wbtc),
      },
    },
  },
  {
    // TODO: this failed with FailedToTransactAsset on statemint somehow
    from: 'acala',
    to: 'assetHubPolkadot',
    route: 'polkadot', // for sending DOT for fee
    name: 'WBTC',
    fromStorage: ({ alice }: Context) => ({
      Tokens: {
        Accounts: [[[alice.address, acala.wbtc], { free: 1e8 }]],
      },
    }),
    toStorage: ({ alice }: Context) => ({
      System: {
        account: [[[acala.paraAccount], { providers: 1, data: { free: 10e10 } }]],
      },
      Assets: {
        account: [
          [[assetHubPolkadot.wbtcIndex, acala.paraAccount], { balance: 10e8 }],
          [[assetHubPolkadot.wbtcIndex, alice.address], { balance: 10e8 }],
        ],
        asset: [[[assetHubPolkadot.wbtcIndex], { supply: 10e8 }]],
      },
    }),
    test: {
      xtokenstHorizontal: {
        tx: tx.xtokens.transferMulticurrencies(
          acala.wbtc,
          1e7,
          acala.dot, // fee
          1e10,
          tx.xtokens.parachainV3(assetHubPolkadot.paraId),
        ),
        fromBalance: query.tokens(acala.wbtc),
        toBalance: query.assets(assetHubPolkadot.wbtcIndex),
      },
    },
  },
  // acala <-> hydraDX
  {
    from: 'acala',
    to: 'hydraDX',
    name: 'DAI',
    precision: 2, // fee varies a lot on hydraDX
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
      xtokenstHorizontal: {
        tx: tx.xtokens.transfer(acala.dai, 10n ** 18n, tx.xtokens.parachainV3(hydraDX.paraId)),
        fromBalance: query.evm(acala.dai.Erc20, '0x2aef47e62c966f0695d5af370ddc1bc7c56902063eee60853e2872fc0ff4f88c'),
        toBalance: query.tokens(hydraDX.dai),
      },
    },
  },
  // {
  //   from: 'hydraDX',
  //   to: 'acala',
  //   name: 'DAI',
  //   fromStorage: ({ alice }: Context) => ({
  //     Tokens: {
  //       accounts: [[[alice.address, hydraDX.dai], { free: 10n * 10n ** 18n }]],
  //     },
  //   }),
  //   test: {
  //     xtokenstHorizontal: {
  //       tx: tx.xtokens.transfer(hydraDX.dai, 10n ** 18n, tx.xtokens.parachainV3(acala.paraId)),
  //       fromBalance: query.tokens(hydraDX.dai),
  //       toBalance: query.evm(acala.dai.Erc20, '0x2aef47e62c966f0695d5af370ddc1bc7c56902063eee60853e2872fc0ff4f88c'),
  //     },
  //   },
  // },
  // acala <-> moonbeam
  {
    from: 'acala',
    to: 'moonbeam',
    route: 'polkadot',
    name: 'DOT',
    toAccount: ({ alith }: Context) => alith,
    test: {
      xtokenstHorizontal: {
        tx: tx.xtokens.transfer(acala.dot, 1e12, tx.xtokens.parachainAccountId20V3(moonbeam.paraId)),
        fromBalance: query.tokens(acala.dot),
        toBalance: query.assets(moonbeam.dot),
        checkUmp: true,
      },
    },
  },
  // {
  //   from: 'moonbeam',
  //   to: 'acala',
  //   route: 'polkadot',
  //   name: 'DOT',
  //   fromAccount: ({ alith }: Context) => alith,
  //   fromStorage: ({ alith }: Context) => ({
  //     Assets: {
  //       account: [[[moonbeam.dot, alith.address], { balance: 10e12 }]],
  //     },
  //   }),
  //   test: {
  //     xtokenstHorizontal: {
  //       tx: tx.xtokens.transfer({ ForeignAsset: moonbeam.dot }, 1e12, tx.xtokens.parachainV3(acala.paraId)),
  //       fromBalance: query.assets(moonbeam.dot),
  //       toBalance: query.tokens(acala.dot),
  //       checkUmp: true,
  //     },
  //   },
  // },
] as const

export type TestType = (typeof tests)[number]

buildTest(tests)
