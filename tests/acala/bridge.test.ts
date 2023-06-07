import { ApiPromise } from '@polkadot/api'
import { BasiliskAdapter } from '@polkawallet/bridge/adapters/hydradx'
import { Bridge } from '@polkawallet/bridge'
import { FixedPointNumber } from '@acala-network/sdk-core'
import { KaruraAdapter } from '@polkawallet/bridge/adapters/acala'
import { KusamaAdapter } from '@polkawallet/bridge/adapters/polkadot'
import { MoonriverAdapter } from '@polkawallet/bridge/adapters/moonbeam'
import { Network, createNetworks } from '../../networks'
import { StatemineAdapter } from '@polkawallet/bridge/adapters/statemint'
import { beforeEach, describe, it } from 'vitest'
import { check, testingPairs } from '@acala-network/chopsticks-testing'
import { checkEvents, checkSystemEvents } from '../../helpers'

describe.each([
  {
    name: 'karura',
    relay: 'kusama',
    token: 'KSM'
  },
  {
    name: 'kusama',
    relay: 'karura',
    token: 'KSM'
  },
  {
    name: 'statemine',
    relay: 'kusama',
    token: 'KSM'
  },
  {
    name: 'basilisk',
    relay: 'karura',
    token: 'KUSD'
  }


] as const)('$name bridgeSDK', async ({ name, relay, token }) => {
  let relaychain: Network
  let parachain: Network

  const { alice } = testingPairs()

  describe('parachain bridge to releaychain', () => {
    beforeEach(async () => {
        const { [name]: parachain1, [relay]: relaychain1 } = await createNetworks({
          [name]: undefined,
          [relay]: undefined
        })
        if (name == 'karura') {
          await parachain1.dev.setStorage({
            Tokens: {
              Accounts: [
                [[alice.address, { Token: 'KUSD' }], { free: 10 * 1e12 }],
                [[alice.address, { Token: 'AUSD' }], { free: 10 * 1e12 }]
              ]
            }
          })
        }
        if (relay == 'karura') {
          await relaychain1.dev.setStorage({
            Tokens: {
              Accounts: [
                [[alice.address, { Token: 'KUSD' }], { free: 10 * 1e12 }],
                [[alice.address, { Token: 'AUSD' }], { free: 10 * 1e12 }]
              ]
            }
          })
        }
        relaychain = relaychain1
        parachain = parachain1

        return async () => {
          await relaychain.teardown()
          await parachain.teardown()
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
      }


      if (adapter) {
        await adapter.init(api)
      }

      return adapter
    }


    it('Cross-chain using BridgeSDK works', async () => {
      const fromChain = await chooseAdapter(name, parachain.api)
      const toChain = await chooseAdapter(relay, relaychain.api)
      const sdk = new Bridge({ adapters: [fromChain as any, toChain as any] })
      const fromAdapter = sdk.findAdapter(name)
      const fromData = fromAdapter.getToken(token, fromAdapter.chain.id)
      // const relaychainBalanceInitial = (await sdk.findAdapter(relay).getTokenBalance(token, alice.address)).free
      // expect(relaychainBalanceInitial.toNumber()).toEqual(10)
      const amount = new FixedPointNumber(1, fromData.decimals)
      const tx = await fromAdapter.createTx({
        amount: amount,
        to: relay,
        token: 'KSM',
        address: alice.address,
        signer: alice.address
      })
      const event = await tx.signAndSend(alice)
      await parachain.chain.newBlock()
      await checkEvents(event as any)
      // await checkSystemEvents(parachain).redact({ number: true }).toMatchSnapshot()
      await relaychain.chain.newBlock()
      await checkSystemEvents(relaychain).redact({ address: true }).toMatchSnapshot()
      await check(((await sdk.findAdapter(relay).getTokenBalance(token, alice.address)).available).toString()).toMatchSnapshot()
      // const relaychainBalanceNow =  (await sdk.findAdapter(relay).getTokenBalance(token, alice.address)).free
      // expect(relaychainBalanceNow.toNumber()).toEqual(10.999909712564)
      // const BalanceChange = relaychainBalanceNow.toNumber() - relaychainBalanceInitial.toNumber()
      // const DestinationChainTransferFee = amount.toNumber() - BalanceChange
      // expect(BalanceChange).toEqual(0.9999097125639995)
      // expect(DestinationChainTransferFee).toEqual(0.00009028743600048017)
    })

  })
})
