import { beforeEach, describe, it } from 'vitest'
import { sendTransaction, testingPairs } from '@acala-network/chopsticks-testing'

import { Network, createNetworks } from '../../networks'
import { checkEvents, checkSystemEvents, checkUmp } from '../../helpers'

describe.each([
  {
    name: 'karura',
    relay: 'kusama',
    unbond: { para: 4382523, relay: 18023827, era: '0x42140000' },
  },
  {
    name: 'acala2180',
    relay: 'polkadot',
    unbond: { para: 3853103, relay: 16080921, era: '0x5c040000' },
  },
  {
    name: 'acala',
    relay: 'polkadot',
    unbond: { para: 3853103, relay: 16080921, era: '0x5c040000' },
  },
] as const)('$name homa', async ({ name, relay, unbond }) => {
  let relaychain: Network
  let parachain: Network

  const { alice } = testingPairs()

  describe('with latest block', () => {
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

    it('Homa stake works', async () => {
      const tx0 = await sendTransaction(parachain.api.tx.homa.mint(1e12).signAsync(alice, { nonce: 0 }))
      const tx1 = await sendTransaction(
        parachain.api.tx.sudo.sudo(parachain.api.tx.homa.forceBumpCurrentEra(0)).signAsync(alice, { nonce: 1 })
      )

      await parachain.chain.newBlock()

      await checkEvents(tx0, 'homa').redact({ number: true }).toMatchSnapshot()
      await checkEvents(tx1, { section: 'homa', method: 'CurrentEraBumped' }).toMatchSnapshot()
      await checkUmp(parachain).redact({ number: true, hex: true }).toMatchSnapshot()

      await relaychain.chain.newBlock()

      await checkSystemEvents(relaychain, 'ump', 'staking', 'messageQueue')
        .redact({ address: true, number: true })
        .toMatchSnapshot()
    })

    it('Homa redeem unbond works', async () => {
      const tx0 = await sendTransaction(parachain.api.tx.homa.requestRedeem(1e12, false).signAsync(alice, { nonce: 0 }))
      const tx1 = await sendTransaction(
        parachain.api.tx.sudo.sudo(parachain.api.tx.homa.forceBumpCurrentEra(0)).signAsync(alice, { nonce: 1 })
      )

      await parachain.chain.newBlock()

      await checkEvents(tx0, { section: 'homa', method: 'RequestedRedeem' }).toMatchSnapshot()
      await checkEvents(tx1, { section: 'homa', method: 'RedeemedByUnbond' }).toMatchSnapshot()

      await relaychain.chain.newBlock()

      await checkSystemEvents(relaychain, 'ump', 'staking', 'messageQueue').redact({ address: true }).toMatchSnapshot()
    })
  })

  describe('with specific block', () => {
    beforeEach(async () => {
      const { [name]: parachain1, [relay]: relaychain1 } = await createNetworks({
        [name]: {
          blockNumber: unbond.para,
        },
        [relay]: {
          blockNumber: unbond.relay,
        },
      })

      relaychain = relaychain1
      parachain = parachain1

      await parachain.dev.setStorage({
        Homa: {
          relayChainCurrentEra: unbond.era,
        },
      })

      return async () => {
        await relaychain.teardown()
        await parachain.teardown()
      }
    })

    it('unbond withdraw works', async () => {
      const tx = await sendTransaction(
        parachain.api.tx.sudo.sudo(parachain.api.tx.homa.forceBumpCurrentEra(1)).signAsync(alice)
      )
      await parachain.chain.newBlock()
      await checkEvents(tx, { section: 'homa', method: 'CurrentEraBumped' }).toMatchSnapshot()
      await checkUmp(parachain).toMatchSnapshot()

      await relaychain.chain.newBlock()
      await checkSystemEvents(relaychain, 'ump', 'staking', 'messageQueue').toMatchSnapshot()
    })
  })
})
