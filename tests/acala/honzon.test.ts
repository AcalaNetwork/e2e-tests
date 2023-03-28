import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { sendTransaction, testingPairs } from '@acala-network/chopsticks-testing'

import { adjustLoan, adjustLoanByDebitValue, closeLoanHasDebitByDex } from '../../helpers/api/extrinsics'
import { check, checkEvents } from '../../helpers'
import { queryPositions, queryTokenBalance } from '../../helpers/api/query'
import networks from '../../networks'

describe('Karura honzon', async () => {
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

    await checkEvents(tx, { section: 'loans', method: 'PositionUpdated' }).toMatchSnapshot()
    expect(
      await check(queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address))
        .redact()
        .value()
    ).toMatchInlineSnapshot(`
      {
        "free": "(rounded 150000000000000)",
        "frozen": 0,
        "reserved": 0,
      }
    `)
    expect(await queryPositions(karura.api, 'KSM', alice.address)).toMatchInlineSnapshot(`
      {
        "collateral": 50000000000000,
        "debit": 500000000000000,
      }
    `)
  })

  it('honzon payback works', async () => {
    expect(await queryPositions(karura.api, 'KSM', alice.address)).toMatchInlineSnapshot(`
      {
        "collateral": 50000000000000,
        "debit": 500000000000000,
      }
    `)
    const tx = await sendTransaction(
      adjustLoanByDebitValue(karura.api, 'KSM', '-50000000000000', '-500000000000000').signAsync(alice, { nonce: 0 })
    )

    await karura.chain.newBlock()

    await checkEvents(tx, { section: 'loans', method: 'PositionUpdated' }).toMatchSnapshot()
    expect(
      await check(queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address))
        .redact()
        .value()
    ).toMatchInlineSnapshot(`
      {
        "free": "(rounded 48000000000000)",
        "frozen": 0,
        "reserved": 0,
      }
    `)
    expect(await queryPositions(karura.api, 'KSM', alice.address)).toMatchInlineSnapshot(`
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

    await checkEvents(tx0, { section: 'loans', method: 'PositionUpdated' }).toMatchSnapshot()

    expect(await queryPositions(karura.api, 'KSM', alice.address)).toMatchInlineSnapshot(`
      {
        "collateral": 50000000000000,
        "debit": 500000000000000,
      }
    `)

    const tx1 = await sendTransaction(
      closeLoanHasDebitByDex(karura.api, 'KSM', '50000000000000').signAsync(alice, { nonce: 1 })
    )

    await karura.chain.newBlock()

    await checkEvents(
      tx1,
      { section: 'loans', method: 'PositionUpdated' },
      { section: 'cdpEngine', method: 'CloseCDPInDebitByDEX' }
    )
      .redact({ number: 1 }) // reduce precision to ensure it passes
      .toMatchSnapshot()
    expect(await queryPositions(karura.api, 'KSM', alice.address)).toMatchInlineSnapshot(`
      {
        "collateral": 0,
        "debit": 0,
      }
    `)
  })
})
