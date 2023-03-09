import { afterAll, describe, expect, it } from 'vitest'
import { connectParachains } from '@acala-network/chopsticks'

import {
  balance,
  expectJson,
  matchEvents,
  matchHrmp,
  matchSystemEvents,
  sendTransaction,
  testingPairs,
} from '../helper'
import { xTokensTransferMulticurrencies } from '../api/extrinsics'
import networks from '../networks'

describe('Karura <-> Statemine', async () => {
  const statemine = await networks.statemine()
  const karura = await networks.karura()
  await connectParachains([statemine.chain, karura.chain])

  const { alice, bob } = testingPairs()

  afterAll(async () => {
    await statemine.teardown()
    await karura.teardown()
  })

  it('0. Statemine transfer assets to Karura', async () => {
    // give Alice some KSM and USDt
    await statemine.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e10 } }]],
      },
      Assets: {
        Account: [[[1984, alice.address], { balance: 1000e6 }]],
      },
    })

    // ensure balance was given
    expect(await balance(statemine.api, alice.address)).toMatchInlineSnapshot(`
      {
        "feeFrozen": 0,
        "free": 10000000000000,
        "miscFrozen": 0,
        "reserved": 0,
      }
    `)
    expect((await statemine.api.query.assets.account(1984, alice.address)).toHuman()).toMatchInlineSnapshot(`
      {
        "balance": "1,000,000,000",
        "extra": null,
        "isFrozen": false,
        "reason": "Consumer",
      }
    `)

    await statemine.api.tx.polkadotXcm
      .limitedReserveTransferAssets(
        {
          V0: {
            X2: [{ Parent: null }, { Parachain: 2000 }],
          },
        },
        {
          V0: {
            X1: {
              AccountId32: {
                network: 'Any',
                id: alice.addressRaw,
              },
            },
          },
        },
        {
          V0: [
            {
              ConcreteFungible: {
                amount: 10e6,
                id: {
                  X2: [{ PalletInstance: 50 }, { GeneralIndex: 1984 }],
                },
              },
            },
          ],
        },
        0,
        { Unlimited: null }
      )
      .signAndSend(alice)

    await statemine.chain.newBlock()
    await karura.chain.upcomingBlock()

    expect(await balance(statemine.api, alice.address)).toMatchInlineSnapshot(`
      {
        "feeFrozen": 0,
        "free": 9999937253833,
        "miscFrozen": 0,
        "reserved": 0,
      }
    `)
    await matchSystemEvents(statemine, {
      section: 'polkadotXcm',
      method: 'Attempted',
    })

    await matchSystemEvents(karura, {
      section: 'xcmpQueue',
      method: 'Success',
    })

    // ensure Alice got the money
    expect((await karura.api.query.tokens.accounts(alice.address, { ForeignAsset: '7' })).toHuman())
      .toMatchInlineSnapshot(`
      {
        "free": "9,999,192",
        "frozen": "0",
        "reserved": "0",
      }
    `)
  })

  it('1. Karura transfer assets to Statemine', async () => {
    await karura.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e10 } }]],
      },
      Tokens: {
        Accounts: [[[alice.address, { Token: 'KSM' }], { free: 10 * 1e12 }]],
      },
    })
    expect(await balance(statemine.api, alice.address)).toMatchInlineSnapshot(`
      {
        "feeFrozen": 0,
        "free": 9999937253833,
        "miscFrozen": 0,
        "reserved": 0,
      }
    `)
    expect(await balance(karura.api, alice.address)).toMatchInlineSnapshot(`
      {
        "feeFrozen": 0,
        "free": 10000000000000,
        "miscFrozen": 0,
        "reserved": 0,
      }
    `)
    expect((await karura.api.query.tokens.accounts(alice.address, { ForeignAsset: '7' })).toHuman())
      .toMatchInlineSnapshot(`
      {
        "free": "9,999,192",
        "frozen": "0",
        "reserved": "0",
      }
    `)
    const tx = await sendTransaction(
      xTokensTransferMulticurrencies(karura.api, '7', '9999192', '1000', bob.addressRaw).signAsync(alice)
    )
    await karura.chain.newBlock()
    await statemine.chain.upcomingBlock()

    expectJson(await karura.api.query.tokens.accounts(alice.address, { ForeignAsset: '7' })).toMatchInlineSnapshot(`
      {
        "free": 0,
        "frozen": 0,
        "reserved": 0,
      }
    `)

    await matchEvents(tx.events, 'xTokens', 'TransferredMultiAssets', 'xcmpQueue')
    await matchHrmp(karura)
    await matchSystemEvents(statemine, {
      section: 'xcmpQueue',
      method: 'Success',
    })
    expectJson(await statemine.api.query.assets.account(1984, bob.address)).toMatchInlineSnapshot(`
      {
        "balance": 9999192,
        "extra": null,
        "isFrozen": false,
        "reason": {
          "sufficient": null,
        },
      }
    `)
    // expectEvent(await statemine.api.query.system.events(), {
    //   event: expect.objectContaining({
    //     section: 'xcmpQueue',
    //     method: 'Success'
    //   })
    // })
  })
})
