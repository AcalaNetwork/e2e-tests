import { Bridge } from '@polkawallet/bridge'
import { FixedPointNumber } from '@acala-network/sdk-core'
import { KaruraAdapter } from '@polkawallet/bridge/adapters/acala'
import { KusamaAdapter } from '@polkawallet/bridge/adapters/polkadot'
import { Network, createNetworks } from '../../networks'
import { beforeEach, describe, it } from 'vitest'
import { check, testingPairs } from '@acala-network/chopsticks-testing'
import { checkEvents, checkSystemEvents, checkUmp } from '../../helpers'
import { queryTokenBalance } from '../../helpers/api/query'

describe.each([
  {
    name: 'karura',
    relay: 'kusama'
  }
] as const)('$name bridgeSDK', async ({ name, relay }) => {
  let relaychain: Network
  let parachain: Network

  const { alice } = testingPairs()

  describe('parachain bridge to releaychain', () => {
    beforeEach(async () => {
      const { [name]: parachain1, [relay]: relaychain1 } = await createNetworks({
        [name]: undefined,
        [relay]: undefined
      })

      relaychain = relaychain1
      parachain = parachain1

      return async () => {
        await relaychain.teardown()
        await parachain.teardown()
      }
    })

    it('xTokens works', async () => {
      const karua = new KaruraAdapter()
      await karua.init(parachain.api as any)
      const kusama = new KusamaAdapter()
      await kusama.init(relaychain.api as any)
      const sdk = new Bridge({ adapters: [karua, kusama] })
      const fromAdapter = sdk.findAdapter(name)
      const fromData = fromAdapter.getToken('KSM', fromAdapter.chain.id)
      const tx = await fromAdapter.createTx({
        amount: new FixedPointNumber(1, fromData.decimals),
        to: relay,
        token: 'KSM',
        address: alice.address,
        signer: alice.address
      })

      const event = await tx.signAndSend(alice)
      await parachain.chain.newBlock()
      await checkEvents(event as any)
      await checkUmp(parachain).redact({ number: true }).toMatchSnapshot()
      await checkSystemEvents(relaychain).redact({address: true}).toMatchSnapshot()
      await relaychain.chain.newBlock()
      await check(queryTokenBalance(parachain.api, {Token: "KSM"}, alice.address)).toMatchSnapshot()
      await check(relaychain.api.query.system.account(alice.address)).toMatchSnapshot()
    })
  })
  //
  // describe('releaychain bridge to parachain', () => {
  //   beforeEach(async () => {
  //     const { [name]: parachain1, [relay]: relaychain1 } = await createNetworks({
  //       [name]: undefined,
  //       [relay]: undefined,
  //     })
  //
  //     relaychain = relaychain1
  //     parachain = parachain1
  //
  //     return async () => {
  //       await relaychain.teardown()
  //       await parachain.teardown()
  //     }
  //   })
  //
  // })
})
