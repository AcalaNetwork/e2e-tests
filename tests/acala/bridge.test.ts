import { Bridge } from '@polkawallet/bridge'
import { FixedPointNumber } from '@acala-network/sdk-core';
import { KaruraAdapter } from '@polkawallet/bridge/adapters/acala';
import { KusamaAdapter } from '@polkawallet/bridge/adapters/polkadot'
import { Network, createNetworks } from '../../networks'
import { beforeEach, describe, it } from 'vitest'
import { checkEvents, checkSystemEvents, checkUmp } from '../../helpers'
import { testingPairs } from '@acala-network/chopsticks-testing'

describe.each([
  {
    name: 'karura',
    relay: 'kusama'
  },
] as const)('$name bridgeSDK', async ({ name, relay }) => {
  let relaychain: Network
  let parachain: Network

  const { alice } = testingPairs()

  describe('parachain bridge to releaychain', () => {
    beforeEach(async () => {
      const { [name]: parachain1, [relay]: relaychain1 } = await createNetworks({
        [name]: undefined,
        [relay]: undefined,
      })

      relaychain = relaychain1
      parachain = parachain1

      return async () => {
        await relaychain.teardown()
        await parachain.teardown()
      }
    })

    it('xTokens works', async () => {
      const karua = new KaruraAdapter();
      await karua.init(parachain.api as any)
      const kusama = new KusamaAdapter()
      await kusama.init(relaychain.api as any)
      const sdk = new Bridge({adapters: [karua, kusama]})
      const fromAdapter = sdk.findAdapter(name);
      const fromData = fromAdapter.getToken('KSM', fromAdapter.chain.id)
      const tx = await fromAdapter.createTx({
        amount: FixedPointNumber.fromInner("10000000000", fromData.decimals),
        to: relay,
        token: 'KSM',
        address: alice.address,
        signer: alice.address,
      });

      const event = tx.signAndSend(alice)
      await parachain.chain.newBlock()
      await checkEvents(event)
      await checkUmp(parachain).redact({ number: true, hex: true }).toMatchSnapshot()

      await relaychain.chain.newBlock()

      await checkSystemEvents(relaychain, 'ump', 'staking').redact({ address: true, number: true }).toMatchSnapshot()
    })
  })

  describe('releaychain bridge to parachain', () => {
    beforeEach(async () => {
      const { [name]: parachain1, [relay]: relaychain1 } = await createNetworks({
        [name]: undefined,
        [relay]: undefined,
      })

      relaychain = relaychain1
      parachain = parachain1

      return async () => {
        await relaychain.teardown()
        await parachain.teardown()
      }
    })

  })
})
