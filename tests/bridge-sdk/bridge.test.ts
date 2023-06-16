import { AcalaAdapter, KaruraAdapter } from '@polkawallet/bridge/adapters/acala'
import { AltairAdapter } from '@polkawallet/bridge/adapters/centrifuge'
import { ApiPromise } from '@polkadot/api'
import { BasiliskAdapter } from '@polkawallet/bridge/adapters/hydradx'
import { BifrostAdapter } from '@polkawallet/bridge/adapters/bifrost'
import { Bridge } from '@polkawallet/bridge'
import { FixedPointNumber } from '@acala-network/sdk-core'
import { HeikoAdapter } from '@polkawallet/bridge/adapters/parallel'
import { KusamaAdapter, PolkadotAdapter } from '@polkawallet/bridge/adapters/polkadot'
import { MoonbeamAdapter, MoonriverAdapter } from '@polkawallet/bridge/adapters/moonbeam'
import { Network, createNetworks } from '../../networks'
import { StatemineAdapter, StatemintAdapter } from '@polkawallet/bridge/adapters/statemint'
import { beforeEach, describe, expect, it } from 'vitest'
import { check, sendTransaction, testingPairs } from '@acala-network/chopsticks-testing'

describe.each([
  {
    from: 'karura',
    to: 'kusama',
    token: 'KSM',
    fee: 0.00009000580000062541,
  },
  {
    from: 'kusama',
    to: 'karura',
    token: 'KSM',
    fee: 0.00003284986200036144,
  },
  {
    from: 'statemine',
    to: 'kusama',
    token: 'KSM',
    fee: 0.00008976839299990047,
  },
  {
    from: 'kusama',
    to: 'statemine',
    token: 'KSM',
    fee: 0.000004896952999544624,
  },
  {
    from: 'basilisk',
    to: 'karura',
    token: 'BSX',
    fee: 0.08012799999999998,
  },
  {
    from: 'karura',
    to: 'basilisk',
    token: 'KUSD',
    fee: 0.00573830458999991,
  },
  {
    from: 'karura',
    to: 'moonriver',
    token: 'KAR',
    fee: 0.03965177808399978,
  },
  {
    from: 'acala',
    to: 'polkadot',
    token: 'DOT',
    fee: 0.04214341399995192,
  },
  {
    from: 'polkadot',
    to: 'acala',
    token: 'DOT',
    fee: 0.00006715029996939847,
  },
  {
    from: 'polkadot',
    to: 'statemint',
    token: 'DOT',
    fee: 0.0010312677000001713,
  },
  {
    from: 'statemint',
    to: 'polkadot',
    token: 'DOT',
    fee: 0.04214341399995192,
  },
  {
    from: 'acala',
    to: 'moonbeam',
    token: 'AUSD',
    fee: 0.020000000000000018,
  },
  {
    from: 'karura',
    to: 'bifrost',
    token: 'KUSD',
    fee: 0.032051199999999946,
  },
  {
    from: 'bifrost',
    to: 'karura',
    token: 'BNC',
    fee: 0.012403363982999904,
  },
  {
    from: 'altair',
    to: 'karura',
    token: 'AIR',
    fee: 0.008012799999999931,
  },
  {
    from: 'karura',
    to: 'altair',
    token: 'KUSD',
    fee: 0.008082399999999934,
  },
  // {
  //   from: 'karura',
  //   to: 'heiko',
  //   token: 'KUSD',
  //   fee: 0.008082399999999934
  // },
  // {
  //   from: 'heiko',
  //   to: 'karura',
  //   token: 'HKO',
  //   fee: 0.008082399999999934
  // }
] as const)('$from to $to using bridgeSDK', async ({ from, to, token, fee }) => {
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
              [[alice.address, { Token: 'KUSD' }], { free: 10 * 1e12 }],
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
      } as any
      const adapter = new adapters[chain]()
      await adapter.init(api)
      return adapter
    }

    async function chainBalance(sdk: any, fromData: any, address: string) {
      const fromChainBalance = (await sdk.findAdapter(from).getTokenBalance(token, alice.address)).available.toNumber()
      let toChainBalance
      if (to == 'moonriver') {
        const assetBalance = (await tochain.api.query.assets.account('10810581592933651521121702237638664357', address))
          .value.balance
        toChainBalance =
          (String(assetBalance) as any) !== 'undefined' ? assetBalance.toNumber() / 10 ** fromData.decimals : 0
      } else if (to == 'moonbeam') {
        const assetBalance = (
          await tochain.api.query.assets.account('110021739665376159354538090254163045594', address)
        ).value.balance
        toChainBalance =
          (String(assetBalance) as any) !== 'undefined' ? assetBalance.toNumber() / 10 ** fromData.decimals : 0
      } else {
        toChainBalance = (await sdk.findAdapter(to).getTokenBalance(token, address)).free.toNumber()
        // await check(await tochain.api.query.system.account(address)).toMatchSnapshot()
      }

      return { address: address, fromChain: fromChainBalance, toChain: toChainBalance }
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
      await check(chainBalanceInitial).toMatchSnapshot()

      const tx = fromAdapter
        .createTx({
          amount: amount,
          to: to,
          token: token,
          address: address,
          signer: alice.address,
        })
        .signAsync(alice)
      // await check(tx).toMatchSnapshot()
      await sendTransaction(tx as any)
      await fromchain.chain.newBlock()
      await tochain.chain.newBlock()

      await sleep(2000)
      const chainBalanceNow = await chainBalance(sdk, fromData, address)
      await check(chainBalanceNow).toMatchSnapshot()

      //Verify if Destination Chain Transfer Fee matches the app
      expect(chainBalanceNow.fromChain).not.toEqual(0)
      if (chainBalanceInitial.toChain == 0) {
        expect(fee).toEqual(amount.toNumber() - chainBalanceNow.toChain)
      } else {
        expect(fee).toEqual(amount.toNumber() - (chainBalanceNow.toChain - chainBalanceInitial.toChain))
      }
    })
  })
})
