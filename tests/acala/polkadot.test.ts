import { afterAll, beforeEach, describe, it } from 'vitest'
import { connectVertical } from '@acala-network/chopsticks'

import { matchEvents, matchJson, matchSystemEvents, matchUmp, sendTransaction, testingPairs } from '../helper'
import networks from '../networks'

describe('Acala <-> Polkadot', async () => {
  const polkadot = await networks.polkadot()
  const acala = await networks.acala()
  await connectVertical(polkadot.chain, acala.chain)

  const { alice } = testingPairs()

  afterAll(async () => {
    await polkadot.teardown()
    await acala.teardown()
  })

  beforeEach(async () => {
    await acala.dev.setStorage({
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
    await polkadot.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
    })
  })

  it('Acala transfer assets to polkadot', async () => {
    const tx = await sendTransaction(
      acala.api.tx.xTokens
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

    await acala.chain.newBlock()

    matchJson(await polkadot.api.query.system.account(alice.address))

    await matchEvents(tx.events, 'xTokens')
    await matchUmp(acala)

    await polkadot.chain.newBlock()

    matchJson(await acala.api.query.tokens.accounts(alice.address, { Token: 'KSM' }))

    await matchSystemEvents(polkadot, 'ump')
  })

  it('Homa stake works', async () => {
    const tx1 = await sendTransaction(acala.api.tx.homa.mint(1e12).signAsync(alice, { nonce: 0 }))
    const tx2 = await sendTransaction(
      acala.api.tx.sudo.sudo(acala.api.tx.homa.forceBumpCurrentEra(0)).signAsync(alice, { nonce: 1 })
    )

    await acala.chain.newBlock()

    await matchEvents(tx1.events, 'homa')
    await matchEvents(tx2.events, { section: 'homa', method: 'CurrentEraBumped' })
    await matchUmp(acala)

    await polkadot.chain.newBlock()

    await matchSystemEvents(polkadot, 'ump', 'staking')
  })

  it('Homa redeem unbond works', async () => {
    const tx3 = await sendTransaction(acala.api.tx.homa.requestRedeem(10 * 1e12, false).signAsync(alice, { nonce: 0 }))
    const tx4 = await sendTransaction(
      acala.api.tx.sudo.sudo(acala.api.tx.homa.forceBumpCurrentEra(0)).signAsync(alice, { nonce: 1 })
    )

    await acala.chain.newBlock()

    await matchEvents(tx3.events, 'homa')
    await matchEvents(tx4.events, 'homa')

    await polkadot.chain.newBlock()

    await matchSystemEvents(polkadot, 'ump', 'staking')
  })
})
