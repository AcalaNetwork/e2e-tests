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
  },
  {
    from: 'kusama',
    to: 'karura',
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
  // {
  //   from: 'basilisk',
  //   to: 'karura',
  //   token: 'BSX',
  // },
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
    token: 'AIR',
  },
  {
    from: 'karura',
    to: 'altair',
    token: 'KUSD',
  },
  // {
  //   from: 'karura',
  //   to: 'heiko',
  //   token: 'KUSD',
  // },
  // {
  //   from: 'heiko',
  //   to: 'karura',
  //   token: 'HKO',
  // }
] as const)('$from to $to using bridgeSDK', async ({ from, to, token }) => {
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
      const fromChainBalance = (await sdk.findAdapter(from).getTokenBalance(token, alice.address)).free.toNumber()
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
      await check(chainBalanceInitial).toMatchSnapshot('initial')

      const tx = fromAdapter
        .createTx({
          amount: amount,
          to: to,
          token: token,
          address: address,
          signer: alice.address,
        })
        .signAsync(alice)

      await sendTransaction(tx as any)

      await fromchain.chain.newBlock()
      await tochain.chain.newBlock()

      await sleep(200)

      const chainBalanceNow = await chainBalance(sdk, fromData, address)
      await check(chainBalanceNow).redact({ number: 3 }).toMatchSnapshot('after')

      //Verify if Destination Chain Transfer Fee matches the app
      expect(chainBalanceNow.fromChain).not.toEqual(0)
      const fee = amount.toNumber() - (chainBalanceNow.toChain - chainBalanceInitial.toChain)
      await check(fee).redact({ number: 2 }).toMatchSnapshot('fee')
    })
  })
})
