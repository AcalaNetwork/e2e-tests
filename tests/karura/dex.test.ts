import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { check, checkEvents, sendTransaction, testingPairs } from '../helper'
import { queryTokenBalance } from '../api/query'
import { stableAssetSwap, swapWithExactSupply, swapWithExactTarget } from '../api/extrinsics'
import networks from '../networks'

describe('Karura dex', async () => {
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
          [[alice.address, { Token: 'KUSD' }], { free: 0 }],
        ],
      },
      Sudo: {
        Key: alice.address,
      },
    })
  })

  it('supply swap works', async () => {
    expect(await queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address)).toMatchInlineSnapshot(`
      {
        "free": 0,
        "frozen": 0,
        "reserved": 0,
      }
    `)
    expect(await queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address)).toMatchInlineSnapshot(`
      {
        "free": 100000000000000,
        "frozen": 0,
        "reserved": 0,
      }
    `)
    const tx = await sendTransaction(
      swapWithExactSupply(karura.api, [{ Token: 'KSM' }, { Token: 'KUSD' }], '1000000000000', '0').signAsync(alice)
    )
    await karura.chain.newBlock()

    await checkEvents(tx, {
      method: 'Swap',
      section: 'dex',
    }).toMatchSnapshot()
    expect(await check(queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address)).redact().value()).toMatchInlineSnapshot(`
      {
        "free": "(rounded 47000000000000)",
        "frozen": 0,
        "reserved": 0,
      }
    `)
    expect(await queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address)).toMatchInlineSnapshot(`
      {
        "free": 99000000000000,
        "frozen": 0,
        "reserved": 0,
      }
    `)
  })

  it('target swap works', async () => {
    expect(await queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address)).toMatchInlineSnapshot(`
      {
        "free": 0,
        "frozen": 0,
        "reserved": 0,
      }
    `)
    expect(await queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address)).toMatchInlineSnapshot(`
      {
        "free": 100000000000000,
        "frozen": 0,
        "reserved": 0,
      }
    `)
    const tx = await sendTransaction(
      swapWithExactTarget(
        karura.api,
        [{ Token: 'KSM' }, { Token: 'KUSD' }],
        '1000000000000',
        '10000000000000'
      ).signAsync(alice, { nonce: 0 })
    )
    await karura.chain.newBlock()

    await checkEvents(tx, {
      method: 'Swap',
      section: 'dex',
    }).toMatchSnapshot()

    expect(await queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address)).toMatchInlineSnapshot(`
      {
        "free": 1000000000000,
        "frozen": 0,
        "reserved": 0,
      }
    `)
    expect(await check(queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address)).redact().value()).toMatchInlineSnapshot(`
      {
        "free": "(rounded 100000000000000)",
        "frozen": 0,
        "reserved": 0,
      }
    `)
  })

  it('stable swap works', async () => {
    expect(await queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address)).toMatchInlineSnapshot(`
      {
        "free": 0,
        "frozen": 0,
        "reserved": 0,
      }
    `)
    expect(await queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address)).toMatchInlineSnapshot(`
      {
        "free": 100000000000000,
        "frozen": 0,
        "reserved": 0,
      }
    `)
    const tx0 = await sendTransaction(
      swapWithExactTarget(
        karura.api,
        [{ Token: 'KSM' }, { Token: 'KUSD' }],
        '1000000000000',
        '10000000000000'
      ).signAsync(alice, { nonce: 0 })
    )
    await karura.chain.newBlock()

    await checkEvents(tx0, {
      method: 'Swap',
      section: 'dex',
    }).toMatchSnapshot()
    expect(await queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address)).toMatchInlineSnapshot(`
      {
        "free": 1000000000000,
        "frozen": 0,
        "reserved": 0,
      }
    `)
    expect(await check(queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address)).redact().value()).toMatchInlineSnapshot(`
      {
        "free": "(rounded 100000000000000)",
        "frozen": 0,
        "reserved": 0,
      }
    `)
    const tx1 = await sendTransaction(
      stableAssetSwap(karura.api, '1', '0', '2', '1000000000000', '0', '3').signAsync(alice, { nonce: 1 })
    )
    await karura.chain.newBlock()

    await checkEvents(tx1, { method: 'TokenSwapped', section: 'stableAsset' }).toMatchSnapshot()
    expect(await queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address)).toMatchInlineSnapshot(`
      {
        "free": 0,
        "frozen": 0,
        "reserved": 0,
      }
    `)
    expect(await check(queryTokenBalance(karura.api, { ForeignAsset: '7' }, alice.address)).redact().value()).toMatchInlineSnapshot(`
      {
        "free": "(rounded 730000)",
        "frozen": 0,
        "reserved": 0,
      }
    `)
  })
})
