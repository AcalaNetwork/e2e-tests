import { afterAll, beforeEach, describe, it } from 'vitest'

import { adjustLoan, adjustLoanByDebitValue, closeLoanHasDebitByDex } from '../api/extrinsics'
import { expectJson, matchEvents, sendTransaction, testingPairs } from '../helper'
import { queryPositions, queryTokenBalance } from '../api/query'
import networks from '../networks'

describe('Karura <-> Kusama', async () => {
  const karura = await networks.karura()

  const { alice } = testingPairs()

  afterAll(async () => {
    await karura.teardown()
  })

  beforeEach(async () => {
    await karura.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
      Tokens: {
        Accounts: [
          [[alice.address, { Token: 'KSM' }], { free: 100 * 1e12 }],
          [[alice.address, { Token: 'LKSM' }], { free: 1000 * 1e12 }],
          [[alice.address, { Token: 'KUSD' }], { free: 100 * 1e12 }],
        ],
      },
      Sudo: {
        Key: alice.address,
      },
    })
  })

  it('honzon deposit and debit works', async () => {
    const tx = await sendTransaction(
      adjustLoan(karura.api, 'KSM', '50000000000000', '500000000000000').signAsync(alice)
    )
    await karura.chain.newBlock()
    await matchEvents(tx.events, { section: 'loans', method: 'PositionUpdated' })
    expectJson(await queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address)).toMatchInlineSnapshot(`
      {
        "free": 152372833376614,
        "frozen": 0,
        "reserved": 0,
      }
    `)
    expectJson(await queryPositions(karura.api, 'KSM', alice.address)).toMatchInlineSnapshot(`
      {
        "collateral": 50000000000000,
        "debit": 500000000000000,
      }
    `)
  })

  it('honzon payback works', async () => {
    expectJson(await queryPositions(karura.api, 'KSM', alice.address)).toMatchInlineSnapshot(`
      {
        "collateral": 50000000000000,
        "debit": 500000000000000,
      }
    `)
    const tx = await sendTransaction(
      adjustLoanByDebitValue(karura.api, 'KSM', '-50000000000000', '-500000000000000').signAsync(alice, { nonce: 0 })
    )
    await karura.chain.newBlock()
    await matchEvents(tx.events, { section: 'loans', method: 'PositionUpdated' })
    expectJson(await queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address)).toMatchInlineSnapshot(`
      {
        "free": 47627166034315,
        "frozen": 0,
        "reserved": 0,
      }
    `)
    expectJson(await queryPositions(karura.api, 'KSM', alice.address)).toMatchInlineSnapshot(`
      {
        "collateral": 0,
        "debit": 0,
      }
    `)
  })

  it('loans by Dex close works', async () => {
    const tx0 = await sendTransaction(
      adjustLoan(karura.api, 'KSM', '50000000000000', '500000000000000').signAsync(alice, { nonce: 0 })
    )
    await karura.chain.newBlock()
    await matchEvents(tx0.events, { section: 'loans', method: 'PositionUpdated' })

    expectJson(await queryPositions(karura.api, 'KSM', alice.address)).toMatchInlineSnapshot(`
      {
        "collateral": 50000000000000,
        "debit": 500000000000000,
      }
    `)

    const tx1 = await sendTransaction(
      closeLoanHasDebitByDex(karura.api, 'KSM', '50000000000000').signAsync(alice, { nonce: 1 })
    )
    await karura.chain.newBlock()
    await matchEvents(
      tx1.events,
      { section: 'loans', method: 'PositionUpdated' },
      { section: 'cdpEngine', method: 'CloseCDPInDebitByDEX' }
    )
    expectJson(await queryPositions(karura.api, 'KSM', alice.address)).toMatchInlineSnapshot(`
      {
        "collateral": 0,
        "debit": 0,
      }
    `)
  })
})
