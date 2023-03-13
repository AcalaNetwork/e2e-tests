import { afterAll, beforeEach, describe, it } from 'vitest'
import { connectVertical } from '@acala-network/chopsticks'

import {
  check,
  checkEvents,
  checkSystemEvents,
  checkUmp,
  sendTransaction,
  testingPairs,
} from '../helper'
import networks from '../networks'

describe.each([
  {
    para: 'acala',
    relay: 'polkadot',
    relayToken: 'DOT',
    relayLiquidToken: 'LDOT',
  },
  {
    para: 'karura',
    relay: 'kusama',
    relayToken: 'KSM',
    relayLiquidToken: 'LKSM',
  }
])('$para <-> $relay', async ({ para, relay, relayToken, relayLiquidToken }) => {
  const relaychain = await networks[relay as keyof typeof networks]()
  const parachain = await networks[para as keyof typeof networks]()
  await connectVertical(relaychain.chain, parachain.chain)

  const { alice } = testingPairs()

  afterAll(async () => {
    await relaychain.teardown()
    await parachain.teardown()
  })

  beforeEach(async () => {
    await parachain.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
      Tokens: {
        Accounts: [
          [[alice.address, { Token: relayToken }], { free: 10 * 1e12 }],
          [[alice.address, { Token: relayLiquidToken }], { free: 100 * 1e12 }],
        ],
      },
      Sudo: {
        Key: alice.address,
      },
    })
    await relaychain.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
    })
  })

  it('parachain transfer assets to relaychain', async () => {
    const tx = await sendTransaction(
      parachain.api.tx.xTokens
        .transfer(
          {
            Token: relayToken,
          },
          1e12,
          {
            V1: {
              parents: 1,
              interior: {
                X1: {
                  AccountId32: {
                    network: 'Any',
                    id: alice.addressRaw,
                  },
                },
              },
            },
          },
          'Unlimited'
        )
        .signAsync(alice)
    )

    await parachain.chain.newBlock()

    await check(relaychain.api.query.system.account(alice.address)).toMatchSnapshot()

    await checkEvents(tx, 'xTokens').toMatchSnapshot()
    await checkUmp(parachain).toMatchSnapshot()

    await relaychain.chain.newBlock()

    await check(parachain.api.query.tokens.accounts(alice.address, { Token: relayToken })).toMatchSnapshot()
    await checkSystemEvents(relaychain, 'ump').toMatchSnapshot()
  })

  it('Homa stake works', async () => {
    const tx1 = await sendTransaction(parachain.api.tx.homa.mint(1e12).signAsync(alice, { nonce: 0 }))
    const tx2 = await sendTransaction(
      parachain.api.tx.sudo.sudo(parachain.api.tx.homa.forceBumpCurrentEra(0)).signAsync(alice, { nonce: 1 })
    )

    await parachain.chain.newBlock()

    await checkEvents(tx1, 'homa').toMatchSnapshot()
    await checkEvents(tx2, { section: 'homa', method: 'CurrentEraBumped' }).toMatchSnapshot()
    await checkUmp(parachain).redact({ number: true, hex: true }).toMatchSnapshot()

    await relaychain.chain.newBlock()

    await checkSystemEvents(relaychain, 'ump', 'staking').redact({ address: true, number: true }).toMatchSnapshot()
  })

  it('Homa redeem unbond works', async () => {
    const tx3 = await sendTransaction(parachain.api.tx.homa.requestRedeem(10 * 1e12, false).signAsync(alice, { nonce: 0 }))
    const tx4 = await sendTransaction(
      parachain.api.tx.sudo.sudo(parachain.api.tx.homa.forceBumpCurrentEra(0)).signAsync(alice, { nonce: 1 })
    )

    await parachain.chain.newBlock()

    await checkEvents(tx3, 'homa').toMatchSnapshot()
    await checkEvents(tx4, 'homa').toMatchSnapshot()

    await relaychain.chain.newBlock()

    await checkSystemEvents(relaychain, 'ump', 'staking').redact({ address: true }).toMatchSnapshot()
  })
})
