import { Context } from '../../networks/types'
import { query, tx } from '../../helpers/api'

import { acala } from '../../networks/acala'
import { hydraDX } from '../../networks/hydraDX'
import { moonbeam } from '../../networks/moonbeam'
import { statemint } from '../../networks/statemint'

import buildTest from './shared'

const tests = [
  // statemint <-> acala
  {
    from: 'statemint',
    to: 'acala',
    name: 'WBTC',
    fromStorage: ({ alice }: Context) => ({
      System: {
        account: [[[acala.paraAccount], { providers: 1, data: { free: 10e10 } }]],
      },
      Assets: {
        account: [[[statemint.wbtcIndex, alice.address], { balance: 1e8 }]],
        asset: [[[statemint.wbtcIndex], { supply: 1e8 }]],
      },
    }),
    test: {
      xcmPalletHorizontal: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(statemint.wbtc, 1e7, tx.xcmPallet.parachainV3(1, acala.paraId)),
        fromBalance: query.assets(statemint.wbtcIndex),
        toBalance: query.tokens(acala.wbtc),
      },
    },
  },
  {
    // TODO: this failed with FailedToTransactAsset on statemint somehow
    from: 'acala',
    to: 'statemint',
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
          [[statemint.wbtcIndex, acala.paraAccount], { balance: 10e8 }],
          [[statemint.wbtcIndex, alice.address], { balance: 10e8 }],
        ],
        asset: [[[statemint.wbtcIndex], { supply: 10e8 }]],
      },
    }),
    test: {
      xtokenstHorizontal: {
        tx: tx.xtokens.transferMulticurrencies(
          acala.wbtc,
          1e7,
          acala.dot, // fee
          1e10,
          tx.xtokens.parachainV3(statemint.paraId),
        ),
        fromBalance: query.tokens(acala.wbtc),
        toBalance: query.assets(statemint.wbtcIndex),
      },
    },
  },
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
  {
    from: 'moonbeam',
    to: 'acala',
    route: 'polkadot',
    name: 'DOT',
    fromAccount: ({ alith }: Context) => alith,
    fromStorage: ({ alith }: Context) => ({
      Assets: {
        account: [[[moonbeam.dot, alith.address], { balance: 10e12 }]],
      },
    }),
    test: {
      xtokenstHorizontal: {
        tx: tx.xtokens.transfer({ ForeignAsset: moonbeam.dot }, 1e12, tx.xtokens.parachainV3(acala.paraId)),
        fromBalance: query.assets(moonbeam.dot),
        toBalance: query.tokens(acala.dot),
        checkUmp: true,
      },
    },
  },
] as const

export type TestType = (typeof tests)[number]

buildTest(tests)
