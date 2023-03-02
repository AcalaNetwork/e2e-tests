import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { connectVertical } from '@acala-network/chopsticks'

import { balance, expectJson, matchEvents, matchSystemEvents, matchUmp, sendTransaction, testingPairs } from '../helper'
import { xTokens } from '../api/extrinsics'
import networks from '../networks'

describe('Karura <-> Kusama', async () => {
  const kusama = await networks.kusama({ wasmOverride: './wasm/kusama_runtime-v9380.compact.compressed.wasm' })
  const karura = await networks.karura({ wasmOverride: './wasm/karura-2140.wasm' })
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

  it('Karura transfer assets to Kusama', async () => {
    const tx = await sendTransaction(
      xTokens(karura.api, true, '', { Token: 'KSM' }, 10n ** 12n, alice.addressRaw).signAsync(alice)
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
        "free": 10999909712564,
        "miscFrozen": 0,
        "reserved": 0,
      }
    `)

    await matchSystemEvents(kusama, 'ump')
  })

  it('Kusama transfer assets to Karura', async () => {
    const tx = await sendTransaction(
      kusama.api.tx.xcmPallet
        .limitedReserveTransferAssets(
          {
            V3: {
              parents: 0,
              interior: {
                X1: { Parachain: 2000 },
              },
            },
          },
          {
            V3: {
              parents: 0,
              interior: {
                X1: {
                  AccountId32: {
                    id: alice.addressRaw,
                  },
                },
              },
            },
          },
          {
            V3: [
              {
                id: { Concrete: { parents: 0, interior: 'Here' } },
                fun: { Fungible: '1000000000000' },
              },
            ],
          },
          0,
          'Unlimited'
        )
        .signAsync(alice, { nonce: 0 })
    )

    await kusama.chain.newBlock()

    await matchEvents(tx.events, 'xcmPallet')

    expect(await balance(kusama.api, alice.address)).toMatchInlineSnapshot(`
      {
        "feeFrozen": 0,
        "free": 8999379005607,
        "miscFrozen": 0,
        "reserved": 0,
      }
    `)

    await karura.chain.upcomingBlock()

    expectJson(await karura.api.query.tokens.accounts(alice.address, { Token: 'KSM' })).toMatchInlineSnapshot(`
      {
        "free": 10999955836390,
        "frozen": 0,
        "reserved": 0,
      }
    `)

    await matchSystemEvents(karura, 'parachainSystem', 'dmpQueue')
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
