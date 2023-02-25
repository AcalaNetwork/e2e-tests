import { afterAll, describe, expect, it } from 'vitest'
import { connectVertical } from '@acala-network/chopsticks'

import { balance, expectEvent, setupContext, testingPairs } from '../helper'

describe('Polkadot <-> Acala', async () => {
  const polkadot = await setupContext({
    endpoint: 'wss://rpc.polkadot.io',
  })
  const acala = await setupContext({
    endpoint: 'wss://acala-rpc-1.aca-api.network',
  })
  await connectVertical(polkadot.chain, acala.chain)

  const { alice, bob } = testingPairs()

  afterAll(async () => {
    await polkadot.teardown()
    await acala.teardown()
  })

  it('0. Polkadot transfer assets to Acala', async () => {
    await polkadot.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e10 } }]],
      },
    })

    expect(await balance(polkadot.api, alice.address)).toMatchInlineSnapshot(`
      {
        "feeFrozen": "0",
        "free": "10,000,000,000,000",
        "miscFrozen": "0",
        "reserved": "0",
      }
    `)
    expect((await acala.api.query.tokens.accounts(alice.address, { token: 'DOT' })).toHuman()).toMatchInlineSnapshot(`
      {
        "free": "0",
        "frozen": "0",
        "reserved": "0",
      }
    `)

    await polkadot.api.tx.xcmPallet
      .reserveTransferAssets(
        {
          V0: {
            X1: {
              Parachain: 2000,
            },
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
              ConcreteFungible: { id: 'Null', amount: 100e10 },
            },
          ],
        },
        0
      )
      .signAndSend(alice)

    await polkadot.chain.newBlock()
    await acala.chain.upcomingBlock()

    expect(await balance(polkadot.api, alice.address)).toMatchInlineSnapshot(`
      {
        "feeFrozen": "0",
        "free": "8,999,815,091,021",
        "miscFrozen": "0",
        "reserved": "0",
      }
    `)
    await expectEvent(polkadot.api.query.system.events(), {
      event: expect.objectContaining({
        section: 'xcmPallet',
        method: 'Attempted',
      }),
    })

    expect((await acala.api.query.tokens.accounts(alice.address, { token: 'DOT' })).toHuman()).toMatchInlineSnapshot(`
      {
        "free": "999,998,266,092",
        "frozen": "0",
        "reserved": "0",
      }
    `)
    await expectEvent(acala.api.query.system.events(), {
      event: expect.objectContaining({
        section: 'parachainSystem',
        method: 'DownwardMessagesReceived',
      }),
    })
  })

  it('1. Acala transfer assets to Polkadot', async () => {
    await acala.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e10 } }]],
      },
      Tokens: {
        Accounts: [[[alice.address, { token: 'DOT' }], { free: 1000e10 }]],
      },
    })
    expect(await balance(polkadot.api, bob.address)).toMatchInlineSnapshot(`
      {
        "feeFrozen": "0",
        "free": "0",
        "miscFrozen": "0",
        "reserved": "0",
      }
    `)
    expect(await balance(acala.api, alice.address)).toMatchInlineSnapshot(`
      {
        "feeFrozen": "0",
        "free": "10,000,000,000,000",
        "miscFrozen": "0",
        "reserved": "0",
      }
    `)
    expect((await acala.api.query.tokens.accounts(alice.address, { token: 'DOT' })).toHuman()).toMatchInlineSnapshot(`
      {
        "free": "10,000,000,000,000",
        "frozen": "0",
        "reserved": "0",
      }
    `)

    await acala.api.tx.xTokens
      .transfer(
        {
          Token: 'DOT',
        },
        10e10,
        {
          V1: {
            parents: 1,
            interior: {
              X1: {
                AccountId32: {
                  network: 'Any',
                  id: bob.addressRaw,
                },
              },
            },
          },
        },
        {
          Unlimited: null,
        }
      )
      .signAndSend(alice)

    await acala.chain.newBlock()
    await polkadot.chain.upcomingBlock()

    expect((await acala.api.query.tokens.accounts(alice.address, { token: 'DOT' })).toHuman()).toMatchInlineSnapshot(`
      {
        "free": "9,900,000,000,000",
        "frozen": "0",
        "reserved": "0",
      }
    `)
    await expectEvent(acala.api.query.system.events(), {
      event: expect.objectContaining({
        section: 'xTokens',
        method: 'TransferredMultiAssets',
      }),
    })

    expect(await balance(polkadot.api, bob.address)).toMatchInlineSnapshot(`
      {
        "feeFrozen": "0",
        "free": "99,530,582,548",
        "miscFrozen": "0",
        "reserved": "0",
      }
    `)
    await expectEvent(polkadot.api.query.system.events(), {
      event: expect.objectContaining({
        section: 'ump',
        method: 'ExecutedUpward',
      }),
    })
  })
})
