import { beforeEach, describe, it } from 'vitest'

import { Network, createContext, createNetworks } from '../networks'
import { check, checkEvents, checkSystemEvents, checkUmp, sendTransaction } from '../helper'

describe.each([
  {
    para: 'acala',
    relay: 'polkadot',
  },
  {
    para: 'karura',
    relay: 'kusama',
  },
] as const)('$para <-> $relay', async ({ para, relay }) => {
  let parachain: Network
  let relaychain: Network
  const ctx = createContext()
  const { alice } = ctx

  beforeEach(async () => {
    const { [para]: parachain1, [relay]: relaychain1 } = await createNetworks(
      {
        [para]: undefined,
        [relay]: undefined,
      } as any,
      ctx
    )

    parachain = parachain1
    relaychain = relaychain1

    return async () => {
      await relaychain.teardown()
      await parachain.teardown()
    }
  })

  it('Homa stake works', async () => {
    const tx1 = await sendTransaction(parachain.api.tx.homa.mint(1e12).signAsync(alice, { nonce: 0 }))
    const tx2 = await sendTransaction(
      parachain.api.tx.sudo.sudo(parachain.api.tx.homa.forceBumpCurrentEra(0)).signAsync(alice, { nonce: 1 })
    )

    await parachain.chain.newBlock()

    await checkEvents(tx1, 'homa').redact({ number: 1 }).toMatchSnapshot()
    await checkEvents(tx2, { section: 'homa', method: 'CurrentEraBumped' }).toMatchSnapshot()
    await checkUmp(parachain).redact({ number: true, hex: true }).toMatchSnapshot()

    await relaychain.chain.newBlock()

    await checkSystemEvents(relaychain, 'ump', 'staking').redact({ address: true, number: true }).toMatchSnapshot()
  })

  it('Homa redeem unbond works', async () => {
    const tx3 = await sendTransaction(
      parachain.api.tx.homa.requestRedeem(10 * 1e12, false).signAsync(alice, { nonce: 0 })
    )
    const tx4 = await sendTransaction(
      parachain.api.tx.sudo.sudo(parachain.api.tx.homa.forceBumpCurrentEra(0)).signAsync(alice, { nonce: 1 })
    )

    await parachain.chain.newBlock()

    await checkEvents(tx3, 'homa').toMatchSnapshot()
    await checkEvents(tx4, 'homa').toMatchSnapshot()
    await checkUmp(parachain).toMatchSnapshot()

    await relaychain.chain.newBlock()

    await checkSystemEvents(relaychain, 'ump', 'staking').redact({ address: true }).toMatchSnapshot()
  })
})
