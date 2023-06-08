import { AcalaAdapter, KaruraAdapter } from '@polkawallet/bridge/adapters/acala'
import { ApiPromise } from '@polkadot/api'
import { BasiliskAdapter } from '@polkawallet/bridge/adapters/hydradx'
import { Bridge } from '@polkawallet/bridge'
import { FixedPointNumber } from '@acala-network/sdk-core'
import { KusamaAdapter, PolkadotAdapter } from '@polkawallet/bridge/adapters/polkadot'
import { MoonbeamAdapter, MoonriverAdapter } from '@polkawallet/bridge/adapters/moonbeam'
import { Network, createNetworks } from '../../networks'
import { StatemineAdapter, StatemintAdapter } from '@polkawallet/bridge/adapters/statemint'
import { beforeEach, describe, expect, it } from 'vitest'
import { check, checkEvents, sendTransaction, testingPairs } from '@acala-network/chopsticks-testing'


describe.each([
  // {
  //   from: 'karura',
  //   to: 'kusama',
  //   token: 'KSM',
  //   fee: 0.00009028743600048017
  // },
  // {
  //   from: 'kusama',
  //   to: 'karura',
  //   token: 'KSM',
  //   fee: 0.00003313519900061124
  // },
  // {
  //   from: 'statemine',
  //   to: 'kusama',
  //   token: 'KSM',
  //   fee: 0.0000900492869995162
  // },
  // {
  //   from: 'kusama',
  //   to: 'statemine',
  //   token: 'KSM',
  //   fee: 0.000005275239999491532
  // },
  {
    from: 'basilisk',
    to: 'karura',
    token: 'BSX',
    fee: 0.003151
  },
  // {
  //   from: 'karura',
  //   to: 'basilisk',
  //   token: 'KUSD',
  //   fee: 0.011862697763999952
  // },
  // {
  //   from: 'karura',
  //   to: 'moonriver',
  //   token: 'KAR',
  //   fee: 0.039651778084
  // },
  // {
  //   from: 'acala',
  //   to: 'polkadot',
  //   token: 'DOT',
  //   fee: 0.04214341399995192
  // },
  // {
  //   from: 'polkadot',
  //   to: 'acala',
  //   token: 'DOT',
  //   fee: 0.00009390549996624031
  // },
  // {
  //   from: 'polkadot',
  //   to: 'statemint',
  //   token: 'DOT',
  //   fee: 0.00008
  // },
  // {
  //   from: 'statemint',
  //   to: 'polkadot',
  //   token: 'DOT',
  //   fee: 0.04214341399995192
  // },
  // {
  //   from: 'acala',
  //   to: 'moonbeam',
  //   token: 'AUSD',
  //   fee: 0.020000000000000018
  // }
] as const)('$from to $to using bridgeSDK', async ({ from, to, token, fee }) => {
  let fromchain: Network
  let tochain: Network

  const { alice } = testingPairs()

  describe('parachain bridge to releaychain', () => {
    beforeEach(async () => {
        const { [from]: fromchain1, [to]: tochain1 } = await createNetworks({
          [from]: undefined,
          [to]: undefined
        })
        if (from == 'karura') {
          await fromchain1.dev.setStorage({
            Tokens: {
              Accounts: [
                [[alice.address, { Token: 'KUSD' }], { free: 10 * 1e12 }],
                [[alice.address, { Token: 'AUSD' }], { free: 10 * 1e12 }]
              ]
            }
          })
        }
        if (to == 'karura') {
          await tochain1.dev.setStorage({
            Tokens: {
              Accounts: [
                [[alice.address, { Token: 'KUSD' }], { free: 10 * 1e12 }],
                [[alice.address, { Token: 'AUSD' }], { free: 10 * 1e12 }]
              ]
            }
          })
        }
        tochain = tochain1
        fromchain = fromchain1

        return async () => {
          await tochain.teardown()
          await fromchain.teardown()
        }
      }
    )

    async function chooseAdapter(chain: string, api: ApiPromise) {
      let adapter

      if (chain === 'karura') {
        adapter = new KaruraAdapter()
      } else if (chain === 'kusama') {
        adapter = new KusamaAdapter()
      } else if (chain == 'moonriver') {
        adapter = new MoonriverAdapter()
      } else if (chain == 'statemine') {
        adapter = new StatemineAdapter()
      } else if (chain == 'basilisk') {
        adapter = new BasiliskAdapter()
      } else if (chain == 'polkadot') {
        adapter = new PolkadotAdapter()
      } else if (chain == 'statemint') {
        adapter = new StatemintAdapter()
      } else if (chain == 'moonbeam') {
        adapter = new MoonbeamAdapter()
      } else if (chain == 'acala') {
        adapter = new AcalaAdapter()
      }

      if (adapter) {
        await adapter.init(api)
      }

      return adapter
    }


    it('Cross-chain using BridgeSDK works', async () => {
      const fromChain = await chooseAdapter(from, fromchain.api)
      const toChain = await chooseAdapter(to, tochain.api)
      const sdk = new Bridge({ adapters: [fromChain as any, toChain as any] })
      const fromAdapter = sdk.findAdapter(from)
      const fromData = fromAdapter.getToken(token, fromAdapter.chain.id)

      const amount = new FixedPointNumber(1, fromData.decimals)
      const address = (to === 'moonriver' || to == 'moonbeam') ? '0x4E7440dB498561A46AAa82b9Bc7d2D5162b5c27B' : alice.address
      await check(((await sdk.findAdapter(from).getTokenBalance(token, address)).available).toNumber()).toMatchSnapshot()
      let tochainBalanceInitial
      if (to == 'moonriver') {
        const assetBalance = (await tochain.api.query.assets.account('10810581592933651521121702237638664357', address)).value.balance
        tochainBalanceInitial = (String(assetBalance) as any !== 'undefined') ? (assetBalance.toNumber()) / 10 ** fromData.decimals : 0
        await check(tochainBalanceInitial).toMatchSnapshot()
      } else if (to == 'moonbeam') {
        const assetBalance = (await tochain.api.query.assets.account('110021739665376159354538090254163045594', address)).value.balance
        tochainBalanceInitial = (String(assetBalance) as any !== 'undefined') ? (assetBalance.toNumber()) / 10 ** fromData.decimals : 0
        await check(tochainBalanceInitial).toMatchSnapshot()
      } else {
        tochainBalanceInitial = ((await sdk.findAdapter(to).getTokenBalance(token, address)).available).toNumber()
        await check(tochainBalanceInitial.toString()).toMatchSnapshot()
      }

      const tx = fromAdapter.createTx({
        amount: amount,
        to: to,
        token: token,
        address: address,
        signer: alice.address
      }).signAsync(alice)
      const event = await sendTransaction(tx as any)
      await checkEvents(event).toMatchSnapshot()
      await fromchain.chain.newBlock()
      await tochain.chain.newBlock()

      // await checkSystemEvents(parachain).redact({ address: true }).toMatchSnapshot()
      // await checkSystemEvents(tochain).redact({ address: true }).toMatchSnapshot()

      let tochainBalanceNow
      await tochain.chain.newBlock()
      if (to == 'moonriver') {
        const assetBalance = (await tochain.api.query.assets.account('10810581592933651521121702237638664357', address)).value.balance
        tochainBalanceNow = (String(assetBalance) as any !== 'undefined') ? (assetBalance.toNumber()) / 10 ** fromData.decimals : 0
        await check(tochainBalanceNow).toMatchSnapshot()
      } else if (to == 'moonbeam') {
        const assetBalance = (await tochain.api.query.assets.account('110021739665376159354538090254163045594', address)).value.balance
        tochainBalanceNow = (String(assetBalance) as any !== 'undefined') ? (assetBalance.toNumber()) / 10 ** fromData.decimals : 0
        await check(tochainBalanceNow).toMatchSnapshot()

      } else {
        tochainBalanceNow = ((await sdk.findAdapter(to).getTokenBalance(token, address)).available).toNumber()
        await check(tochainBalanceNow.toString()).toMatchSnapshot()
      }

      if (tochainBalanceInitial == 0) {
        expect(fee).toEqual(amount.toNumber() - tochainBalanceNow)
      } else {
        expect(fee).toEqual(amount.toNumber() - (tochainBalanceNow - tochainBalanceInitial))
      }
    })

  })
})
