import  { AcalaAdapter, KaruraAdapter } from '@polkawallet/bridge/adapters/acala'
import { AltairAdapter } from '@polkawallet/bridge/adapters/centrifuge'
import { ApiPromise } from '@polkadot/api'
import { AstarAdapter, ShidenAdapter } from '@polkawallet/bridge/adapters/astar'
import { BasiliskAdapter } from '@polkawallet/bridge/adapters/hydradx'
import { BifrostAdapter } from '@polkawallet/bridge/adapters/bifrost'
import { Bridge } from '@polkawallet/bridge'
import { FixedPointNumber } from '@acala-network/sdk-core'
import { HeikoAdapter, ParallelAdapter } from '@polkawallet/bridge/adapters/parallel'
import { InterlayAdapter, KintsugiAdapter } from '@polkawallet/bridge/adapters/interlay'
import { KusamaAdapter, PolkadotAdapter } from '@polkawallet/bridge/adapters/polkadot'
import { MoonbeamAdapter, MoonriverAdapter } from '@polkawallet/bridge/adapters/moonbeam'
import { Network, createNetworks } from '../../networks'
import { QuartzAdapter, UniqueAdapter } from '@polkawallet/bridge/adapters/unique'
import { ShadowAdapter } from '@polkawallet/bridge/adapters/crust'
import { StatemineAdapter, StatemintAdapter } from '@polkawallet/bridge/adapters/statemint'
import { beforeEach, describe, expect, it } from 'vitest'
import { check, sendTransaction, testingPairs } from '@acala-network/chopsticks-testing'

describe.each([
  {
    from: 'karura',
    to: 'kusama',
    token: 'KSM',
  },
  {
    from: 'kusama',
    to: 'karura',
    token: 'KSM',
  },
  {
    from: 'kusama',
    to: 'basilisk',
    token: 'KSM',
  },
  {
    from: 'basilisk',
    to: 'kusama',
    token: 'KSM',
  },
  {
    from: 'statemine',
    to: 'kusama',
    token: 'KSM',
  },
  {
    from: 'kusama',
    to: 'statemine',
    token: 'KSM',
  },
  {
    from: 'basilisk',
    to: 'karura',
    token: 'BSX',
  },
  {
    from: 'karura',
    to: 'basilisk',
    token: 'KUSD',
  },
  {
    from: 'karura',
    to: 'moonriver',
    token: 'KAR',
  },
  {
    from: 'acala',
    to: 'polkadot',
    token: 'DOT',
  },
  {
    from: 'polkadot',
    to: 'acala',
    token: 'DOT',
  },
  {
    from: 'polkadot',
    to: 'statemint',
    token: 'DOT',
  },
  {
    from: 'statemint',
    to: 'polkadot',
    token: 'DOT',
  },
  {
    from: 'acala',
    to: 'moonbeam',
    token: 'AUSD',
  },
  {
    from: 'karura',
    to: 'bifrost',
    token: 'KUSD',
  },
  {
    from: 'bifrost',
    to: 'karura',
    token: 'BNC',
  },
  {
    from: 'altair',
    to: 'karura',
    token: 'KUSD',
  },
  {
    from: 'karura',
    to: 'altair',
    token: 'KUSD',
  },
  {
    from: 'altair',
    to: 'karura',
    token: 'AIR',
  },
  {
    from: 'karura',
    to: 'altair',
    token: 'AIR',
  },
  {
    from: 'shiden',
    to: 'karura',
    token: 'KUSD',
  },
  {
    from: 'karura',
    to: 'shiden',
    token: 'KUSD',
  },
  {
    from: 'astar',
    to: 'acala',
    token: 'AUSD',
  },
  {
    from: 'acala',
    to: 'astar',
    token: 'AUSD',
  },
  {
    from: 'karura',
    to: 'kintsugi',
    token: 'KINT',
  },
  {
    from: 'kintsugi',
    to: 'karura',
    token: 'KINT',
  },
  {
    from: 'karura',
    to: 'kintsugi',
    token: 'LKSM',
  },
  {
    from: 'kintsugi',
    to: 'karura',
    token: 'LKSM',
  },
  {
    from: 'interlay',
    to: 'acala',
    token: 'INTR',
  },
  {
    from: 'acala',
    to: 'interlay',
    token: 'INTR',
  },
  // btc
  // {
  //   from: 'karura',
  //   to: 'kintsugi',
  //   token: 'KBTC',
  //   fee: 0.07407407407400002
  // },
  // {
  //   from: 'kintsugi',
  //   to: 'karura',
  //   token: 'KBTC',
  //   fee: 0.008012799999999931
  // },
  // {
  //   from: 'interlay',
  //   to: 'acala',
  //   token: 'IBTC',
  //   fee: 0.008012799999999931
  // },
  // {
  //   from: 'acala',
  //   to: 'interlay',
  //   token: 'IBTC',
  //   fee: 0.008012799999999931
  // },

  // RpcError: 1: Error: createType(Lookup4):: Unable to construct number from multi-key object
  {
    from: 'karura',
    to: 'heiko',
    token: 'KAR',
  },
  {
    from: 'heiko',
    to: 'karura',
    token: 'HKO',
  },
  {
    from: 'parallel',
    to: 'acala',
    token: 'PARA',
  },
  {
    from: 'acala',
    to: 'parallel',
    token: 'PARA',
  },
  {
    from: 'parallel',
    to: 'acala',
    token: 'ACA',
  },
  {
    from: 'acala',
    to: 'parallel',
    token: 'ACA',
  },


  // Chopsticks are currently not supported.
  // {
  //   from: 'crust',
  //   to: 'karura',
  //   token: 'CSM',
  //   fee: 0.008082399999999934
  // },
  // {
  //   from: 'karura',
  //   to: 'crust',
  //   token: 'CSM',
  //   fee: 0.002080000000000082
  // },
  // {
  //   from: 'unique',
  //   to: 'acala',
  //   token: 'UNQ',
  //   fee: 0.008082399999999934
  // },
  // {
  //   from: 'quartz',
  //   to: 'karura',
  //   token: 'QTZ',
  //   fee: 0.008082399999999934
  // },
  // {
  //   from: 'karura',
  //   to: 'quartz',
  //   token: 'QTZ',
  //   fee: 0.002080000000000082
  // },

] as const)('$from to $to using bridgeSDK cross-chain $token', async ({ from, to, token }) => {
  let fromchain: Network
  let tochain: Network

  const { alice } = testingPairs()

  describe('parachain bridge to releaychain', () => {
    beforeEach(async () => {
      const { [from]: fromchain1, [to]: tochain1 } = await createNetworks({
        [from]: undefined,
        [to]: undefined,
      })
      if (from == 'karura') {
        await fromchain1.dev.setStorage({
          Tokens: {
            Accounts: [
              [[alice.address, { Token: 'KINT' }], { free: '1000000000000000' }],
              [[alice.address, { Token: 'KBTC' }], { free: 3 * 1e8 }],
              [[alice.address, { ForeignAsset: 12 }], { free: '100000000000000000000' }],
              [[alice.address, { Token: 'KUSD' }], { free: 10 * 1e12 }]
            ],
          },
        })
      }
      if (from == 'acala') {
        await fromchain1.dev.setStorage({
          Tokens: {
            Accounts: [
              [[alice.address, { ForeignAsset: 1 }], { free: 10 * 1e12 }],
              [[alice.address, { ForeignAsset: 4 }], { free: 10 * 1e10 }],
              [[alice.address, { ForeignAsset: 3 }], { free: 3 * 1e8 }],
              [[alice.address, { Token: 'AUSD' }], { free: 10 * 1e12 }],
            ],
          },
        })
      }
      if (to == 'karura') {
        await tochain1.dev.setStorage({
          Tokens: {
            Accounts: [
              [[alice.address, { Token: 'KUSD' }], { free: 10 * 1e12 }],
              [[alice.address, { Token: 'AUSD' }], { free: 10 * 1e12 }],
            ],
          },
        })
      }
      tochain = tochain1
      fromchain = fromchain1

      return async () => {
        await tochain.teardown()
        await fromchain.teardown()
      }
    })

    async function sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }

    async function chooseAdapter(chain: string, api: ApiPromise) {
      const adapters = {
        karura: KaruraAdapter,
        kusama: KusamaAdapter,
        moonriver: MoonriverAdapter,
        statemine: StatemineAdapter,
        basilisk: BasiliskAdapter,
        polkadot: PolkadotAdapter,
        statemint: StatemintAdapter,
        moonbeam: MoonbeamAdapter,
        acala: AcalaAdapter,
        bifrost: BifrostAdapter,
        altair: AltairAdapter,
        heiko: HeikoAdapter,
        shiden: ShidenAdapter,
        crust: ShadowAdapter,
        quartz: QuartzAdapter,
        unique: UniqueAdapter,
        astar: AstarAdapter,
        interlay: InterlayAdapter,
        kintsugi: KintsugiAdapter,
        parallel: ParallelAdapter,
      } as any
      const adapter = new adapters[chain]()
      await adapter.init(api)
      return adapter
    }

    async function chainBalance(sdk: any, fromData: any, address: string) {
      const fromChainBalance = (await sdk.findAdapter(from).getTokenBalance(token, alice.address)).free.toNumber()
      let tokenDecimals = fromData.decimals
      let toChainBalance
      if (to == 'moonriver') {
        const assetBalance = (await tochain.api.query.assets.account('10810581592933651521121702237638664357', address))
          .value.balance
        toChainBalance =
          (String(assetBalance) as any) !== 'undefined' ? assetBalance.toNumber() / 10 ** fromData.decimals : 0
        tokenDecimals = 18
      } else if (to == 'moonbeam') {
        const assetBalance = (
          await tochain.api.query.assets.account('110021739665376159354538090254163045594', address)
        ).value.balance
        toChainBalance =
          (String(assetBalance) as any) !== 'undefined' ? assetBalance.toNumber() / 10 ** fromData.decimals : 0
        tokenDecimals = 18
      } else {
        toChainBalance = (await sdk.findAdapter(to).getTokenBalance(token, address)).free.toNumber()
      }

      return { address: address, fromChain: fromChainBalance, toChain: toChainBalance, decimals: tokenDecimals}
    }

    it('Cross-chain using BridgeSDK works', async () => {
      const fromChain = await chooseAdapter(from, fromchain.api)
      const toChain = await chooseAdapter(to, tochain.api)
      const sdk = new Bridge({ adapters: [fromChain as any, toChain as any] })
      const fromAdapter = sdk.findAdapter(from)
      const fromData = fromAdapter.getToken(token, fromAdapter.chain.id)

      const amount = new FixedPointNumber(2, fromData.decimals)
      const address =
        to === 'moonriver' || to == 'moonbeam' ? '0x4E7440dB498561A46AAa82b9Bc7d2D5162b5c27B' : alice.address

      const chainBalanceInitial = await chainBalance(sdk, fromData, address)
      await check(chainBalanceInitial).toMatchSnapshot('initial')
      const tx = fromAdapter
        .createTx({
          address: address,
          amount: amount,
          to: to,
          token: token
        })
        .signAsync(alice)

      await sendTransaction(tx as any)

      await fromchain.chain.newBlock()
      await tochain.chain.newBlock()

      await sleep(200)
      const chainBalanceNow = await chainBalance(sdk, fromData, address)
      await check(chainBalanceNow).redact({ number: 3 }).toMatchSnapshot('after')

      //Verify if Destination Chain Transfer Fee matches the app
      expect(chainBalanceNow.fromChain).not.toEqual(chainBalanceInitial.fromChain)
      expect(chainBalanceNow.toChain).not.toEqual(chainBalanceInitial.toChain)
      const fee = amount.toNumber() - (chainBalanceNow.toChain - chainBalanceInitial.toChain)
      await check(fee).redact({ number: 2 }).toMatchSnapshot('fee')
    })
  })
})
