import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { connectVertical } from '@acala-network/chopsticks'

import { balance, expectJson, matchEvents, matchSystemEvents, matchUmp, sendTransaction, testingPairs } from '../helper'
import networks from '../networks'

describe('Karura <-> Kusama', async () => {
  const kusama = await networks.kusama()
  const karura = await networks.karura()
  await connectVertical(kusama.chain, karura.chain)

  const { alice } = testingPairs()

  afterAll(async () => {
    await kusama.teardown()
    await karura.teardown()
  })

  beforeEach(async () => {
    await karura.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
      Tokens: {
        Accounts: [
          [[alice.address, { Token: 'KSM' }], { free: 10 * 1e12 }],
          [[alice.address, { Token: 'LKSM' }], { free: 100 * 1e12 }],
        ],
      },
      Sudo: {
        Key: alice.address,
      },
    })
    await kusama.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
    })
  })

  it('Karura transfer assets to kusama', async () => {
    const tx = await sendTransaction(
      karura.api.tx.xTokens
        .transfer(
          {
            Token: 'KSM',
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

    await karura.chain.newBlock()

    await matchEvents(tx.events, 'xTokens')
    await matchUmp(karura)

    await kusama.chain.upcomingBlock()

    expectJson(await karura.api.query.tokens.accounts(alice.address, { Token: 'KSM' })).toMatchInlineSnapshot(`
      {
        "free": 9000000000000,
        "frozen": 0,
        "reserved": 0,
      }
    `)

    expect(await balance(kusama.api, alice.address)).toMatchInlineSnapshot(`
      {
        "feeFrozen": 0,
        "free": 10999895428355,
        "miscFrozen": 0,
        "reserved": 0,
      }
    `)

    await matchSystemEvents(kusama, 'ump')
  })

  it('Homa stake works', async () => {
    const tx1 = await sendTransaction(karura.api.tx.homa.mint(1e12).signAsync(alice, { nonce: 0 }))
    const tx2 = await sendTransaction(
      karura.api.tx.sudo.sudo(karura.api.tx.homa.forceBumpCurrentEra(0)).signAsync(alice, { nonce: 1 })
    )

    await karura.chain.newBlock()

    await matchEvents(tx1.events, 'homa')
    await matchEvents(tx2.events, { section: 'homa', method: 'CurrentEraBumped' })
    await matchUmp(karura)

    await kusama.chain.upcomingBlock()

    await matchSystemEvents(kusama, 'ump', 'staking')
  })

  it('Homa redeem unbond works', async () => {
    const tx3 = await sendTransaction(karura.api.tx.homa.requestRedeem(10 * 1e12, false).signAsync(alice, { nonce: 0 }))
    const tx4 = await sendTransaction(
      karura.api.tx.sudo.sudo(karura.api.tx.homa.forceBumpCurrentEra(0)).signAsync(alice, { nonce: 1 })
    )

    await karura.chain.newBlock()

    await matchEvents(tx3.events, 'homa')
    await matchEvents(tx4.events, 'homa')

    await kusama.chain.upcomingBlock()

    await matchSystemEvents(kusama, 'ump', 'staking')
  })
})
