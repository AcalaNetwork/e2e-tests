import { afterAll, describe, expect, it } from 'vitest'
import { connectParachains } from '@acala-network/chopsticks'

import { checkEvents, checkHrmp, checkSystemEvents, sendTransaction, testingPairs } from '../helper'
import { xTokensTransferMulticurrenciesV3 } from '../api/extrinsics'
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

  it('Statemine transfer assets to Karura', async () => {
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
    expect(await statemine.api.query.system.account(alice.address)).toMatchInlineSnapshot(`
      {
        "consumers": 0,
        "data": {
          "feeFrozen": 0,
          "free": 10000000000000,
          "miscFrozen": 0,
          "reserved": 0,
        },
        "nonce": 0,
        "providers": 0,
        "sufficients": 0,
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
    await karura.chain.newBlock()

    expect(await statemine.api.query.system.account(alice.address)).toMatchInlineSnapshot(`
      {
        "consumers": 0,
        "data": {
          "feeFrozen": 0,
          "free": 9999937253833,
          "miscFrozen": 0,
          "reserved": 0,
        },
        "nonce": 1,
        "providers": 0,
        "sufficients": 0,
      }
    `)
    await checkSystemEvents(statemine, 'polkadotXcm').toMatchSnapshot()

    await checkSystemEvents(karura, 'xcmpQueue').toMatchSnapshot()

    // ensure Alice got the money
    expect((await karura.api.query.tokens.accounts(alice.address, { ForeignAsset: '7' })).toHuman())
      .toMatchInlineSnapshot(`
        {
          "free": "9,999,199",
          "frozen": "0",
          "reserved": "0",
        }
      `)
  })

  it('Karura transfer assets to Statemine', async () => {
    await karura.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e10 } }]],
      },
      Tokens: {
        Accounts: [[[alice.address, { Token: 'KSM' }], { free: 10 * 1e12 }]],
      },
    })
    expect(await statemine.api.query.system.account(alice.address)).toMatchInlineSnapshot(`
      {
        "consumers": 0,
        "data": {
          "feeFrozen": 0,
          "free": 9999937253833,
          "miscFrozen": 0,
          "reserved": 0,
        },
        "nonce": 1,
        "providers": 0,
        "sufficients": 0,
      }
    `)
    expect(await karura.api.query.system.account(alice.address)).toMatchInlineSnapshot(`
      {
        "consumers": 0,
        "data": {
          "feeFrozen": 0,
          "free": 10000000000000,
          "miscFrozen": 0,
          "reserved": 0,
        },
        "nonce": 0,
        "providers": 0,
        "sufficients": 0,
      }
    `)
    expect((await karura.api.query.tokens.accounts(alice.address, { ForeignAsset: '7' })).toHuman())
      .toMatchInlineSnapshot(`
      {
        "free": "9,999,199",
        "frozen": "0",
        "reserved": "0",
      }
    `)
    const tx = await sendTransaction(
      xTokensTransferMulticurrenciesV3(karura.api, '7', '9999199', '1000', bob.addressRaw).signAsync(alice)
    )
    await karura.chain.newBlock()

    expect(await karura.api.query.tokens.accounts(alice.address, { ForeignAsset: '7' })).toMatchInlineSnapshot(`
      {
        "free": 0,
        "frozen": 0,
        "reserved": 0,
      }
    `)

    await checkEvents(tx, 'xTokens', 'TransferredMultiAssets', 'xcmpQueue').toMatchSnapshot()
    await checkHrmp(karura).toMatchSnapshot()

    await statemine.chain.newBlock()

    await checkSystemEvents(statemine, 'xcmpQueue').toMatchSnapshot()
    expect(await statemine.api.query.assets.account(1984, bob.address)).toMatchInlineSnapshot(`
      {
        "balance": 9999199,
        "extra": null,
        "isFrozen": false,
        "reason": {
          "sufficient": null,
        },
      }
    `)
  })
})
