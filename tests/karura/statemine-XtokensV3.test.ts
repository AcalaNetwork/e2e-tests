import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { connectParachains } from '@acala-network/chopsticks'

import { check, checkEvents, checkHrmp, checkSystemEvents, sendTransaction, testingPairs } from '../helper'
import { xTokensTransferMulticurrenciesV3 } from '../api/extrinsics'
import networks from '../networks'

describe('Karura <-> Statemine', async () => {
  const { alice, bob } = testingPairs()

  const statemine = await networks.statemine()
  const karura = await networks.karura({
    wasmOverride: './wasm/karura-2160-dev.wasm',
  })
  await connectParachains([statemine.chain, karura.chain])

  await karura.dev.newBlock()

  beforeEach(async () => {
    await statemine.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e10 } }]],
      },
      Assets: {
        Account: [[[1984, alice.address], { balance: 1000e6 }]],
      },
    })
    await karura.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e10 } }]],
      },
      Tokens: {
        Accounts: [
          [[alice.address, { Token: 'KSM' }], { free: 10 * 1e12 }],
          [[alice.address, { ForeignAsset: '7' }], { free: 10 * 1e12 }],
        ],
      },
    })
  })

  afterAll(async () => {
    await statemine.teardown()
    await karura.teardown()
  })

  it('Statemine transfer assets to Karura', async () => {
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

    await checkSystemEvents(statemine, 'polkadotXcm').toMatchSnapshot()
    await checkHrmp(statemine).toMatchSnapshot()
    await check(statemine.api.query.system.account(alice.address)).redact().toMatchSnapshot()

    await karura.chain.newBlock()

    await checkSystemEvents(karura, 'xcmpQueue').toMatchSnapshot()

    // ensure Alice got the money
    await check(karura.api.query.tokens.accounts(alice.address, { ForeignAsset: '7' }))
      .redact()
      .toMatchSnapshot()
  })

  it('Karura transfer assets to Statemine', async () => {
    const tx = await sendTransaction(
      xTokensTransferMulticurrenciesV3(karura.api, '7', '9999199', '1000', bob.addressRaw).signAsync(alice)
    )
    await karura.chain.newBlock()

    await check(karura.api.query.tokens.accounts(alice.address, { ForeignAsset: '7' }))
      .redact()
      .toMatchSnapshot()

    await checkEvents(tx, 'xTokens', 'xcmpQueue').toMatchSnapshot()
    await checkHrmp(karura).toMatchSnapshot()

    await statemine.chain.newBlock()

    await checkSystemEvents(statemine, 'xcmpQueue').toMatchSnapshot()
    await check(statemine.api.query.assets.account(1984, bob.address)).redact().toMatchSnapshot()
  })
})
