import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { connectVertical } from '@acala-network/chopsticks'

import {
  balance,
  expectEvent,
  expectExtrinsicSuccess,
  expectHuman,
  expectJson,
  sendTransaction,
  testingPairs,
} from '../helper'
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
          [[alice.address, { Token: 'LKSM' }], { free: 0 }],
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
    await kusama.chain.upcomingBlock()

    expectExtrinsicSuccess(await tx.events)
    expectEvent(await tx.events, {
      event: expect.objectContaining({
        section: 'xTokens',
        method: 'TransferredMultiAssets',
      }),
    })

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

    expectEvent(await kusama.api.query.system.events(), {
      event: expect.objectContaining({
        method: 'ExecutedUpward',
        section: 'ump',
        data: [
          '0x740fe61d99a98beab81994c32b7f31445044b01b2fd682936fc5e12ec2c229cb',
          {
            Complete: expect.anything(),
          },
        ],
      }),
    })
  })

  it('Homa stake works', async () => {
    const tx1 = await sendTransaction(karura.api.tx.homa.mint(1e12).signAsync(alice, { nonce: 0 }))
    const tx2 = await sendTransaction(
      karura.api.tx.sudo.sudo(karura.api.tx.homa.forceBumpCurrentEra(0)).signAsync(alice, { nonce: 1 })
    )

    await karura.chain.newBlock()
    await kusama.chain.upcomingBlock()

    expectExtrinsicSuccess(await tx1.events)
    expectExtrinsicSuccess(await tx2.events)

    expectEvent(await tx2.events, {
      event: expect.objectContaining({
        method: 'ExtrinsicSuccess',
        section: 'system',
      }),
    })

    expectEvent(await kusama.api.query.system.events(), {
      event: expect.objectContaining({
        method: 'ExecutedUpward',
        section: 'ump',
        data: [
          '0x7a2dc201d461fb785c8d38af7a6f0ac35ae319e26699890ad1647b5ee4e086d2', // transfer
          {
            Complete: expect.anything(),
          },
        ],
      }),
    })

    expectEvent(await kusama.api.query.system.events(), {
      event: expect.objectContaining({
        method: 'ExecutedUpward',
        section: 'ump',
        data: [
          '0xa7fcef489bdd3f26cadb0e4d6e8da97569eead09b2479c7815cd2af83e205603', // transact
          {
            Complete: expect.anything(),
          },
        ],
      }),
    })

    expectEvent(await kusama.api.query.system.events(), {
      event: expect.objectContaining({
        method: 'Bonded',
        section: 'staking',
      }),
    })
  })
})
