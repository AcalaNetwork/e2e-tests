import { Context } from '../../networks/types'
import { query, tx } from '../../helpers/api'

import { acala } from '../../networks/acala'
import { assetHubPolkadot } from '../../networks/assethub'

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
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(
          assetHubPolkadot.wbtc,
          1e7,
          tx.xcmPallet.parachainV3(1, acala.paraId),
        ),
        fromBalance: query.assets(assetHubPolkadot.wbtcIndex),
        toBalance: query.tokens(acala.wbtc),
      },
    },
  },
  {
    // TODO: this failed with FailedToTransactAsset on assetHubPolkadot somehow
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
          16e9,
          tx.xtokens.parachainV3(assetHubPolkadot.paraId),
        ),
        fromBalance: query.tokens(acala.wbtc),
        toBalance: query.assets(assetHubPolkadot.wbtcIndex),
      },
    },
  },
] as const

export type TestType = (typeof tests)[number]

buildTest(tests)
