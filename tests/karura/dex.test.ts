import { afterAll, beforeEach, describe, it } from 'vitest'

import {
  addLiquidity,
  aggregatedDexSwapWithExactSupply,
  dexRemoveLiquidity,
  swapWithExactSupply,
  swapWithExactTarget,
} from '../api/extrinsics'
import { check, checkEvents, sendTransaction, testingPairs } from '../helper'
import { querySharesAndWithdrawnRewards, queryTokenBalance } from '../api/query'
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
          [[alice.address, { ForeignAsset: '7' }], { free: 0 }],
          [[alice.address, { DexShare: [{ Token: 'KSM' }, { Token: 'LKSM' }] }], { free: 0 }],
        ],
      },
      Sudo: {
        Key: alice.address,
      },
    })
  })

  it('supply swap works', async () => {
    const tx = await sendTransaction(
      swapWithExactSupply(karura.api, [{ Token: 'KSM' }, { Token: 'KUSD' }], '1000000000000', '0').signAsync(alice)
    )

    await karura.chain.newBlock()

    await checkEvents(tx, 'dex').redact({ number: 1 }).toMatchSnapshot()

    await check(queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address))
      .redact({ number: 1 })
      .toMatchSnapshot()

    await check(queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address)).toMatchSnapshot()
  })

  it('target swap works', async () => {
    const tx = await sendTransaction(
      swapWithExactTarget(
        karura.api,
        [{ Token: 'KSM' }, { Token: 'KUSD' }],
        '1000000000000',
        '10000000000000'
      ).signAsync(alice, { nonce: 0 })
    )
    await karura.chain.newBlock()

    await checkEvents(tx, 'dex').redact({ number: 1 }).toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address))
      .redact()
      .toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address))
      .redact()
      .toMatchSnapshot()
  })

  it('aggregatedDex supply swap works', async () => {
    const tx = await sendTransaction(
      aggregatedDexSwapWithExactSupply(
        karura.api,
        [
          {
            Dex: [
              {
                Token: 'KSM',
              },
              {
                ForeignAsset: '0',
              },
              {
                Token: 'KUSD',
              },
            ],
          },
          {
            Taiga: ['1', '0', '2'],
          },
        ],
        '1000000000000',
        '0'
      ).signAsync(alice, { nonce: 0 })
    )

    await karura.chain.newBlock()

    await checkEvents(tx, 'dex', 'stableAsset').redact({ number: 1 }).toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { ForeignAsset: '7' }, alice.address))
      .redact()
      .toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address))
      .redact()
      .toMatchSnapshot()
  })

  it('addLiquidity works', async () => {
    const tx = await sendTransaction(
      addLiquidity(
        karura.api,
        { Token: 'KSM' },
        { Token: 'LKSM' },
        '1000000000000',
        '10000000000000',
        '0',
        false
      ).signAsync(alice, { nonce: 0 })
    )

    await karura.chain.newBlock()

    await checkEvents(tx, { method: 'AddLiquidity', section: 'dex' }).toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { DexShare: [{ Token: 'KSM' }, { Token: 'LKSM' }] }, alice.address))
      .redact()
      .toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address))
      .redact()
      .toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { Token: 'LKSM' }, alice.address))
      .redact()
      .toMatchSnapshot()
  })

  it('dexRemoveLiquidity works ', async () => {
    const tx0 = await sendTransaction(
      addLiquidity(
        karura.api,
        { Token: 'KSM' },
        { Token: 'LKSM' },
        '1000000000000',
        '10000000000000',
        '0',
        false
      ).signAsync(alice, { nonce: 0 })
    )

    await karura.chain.newBlock()

    await checkEvents(tx0, { method: 'AddLiquidity', section: 'dex' }).toMatchSnapshot()

    const balData: any = await queryTokenBalance(
      karura.api,
      { DexShare: [{ Token: 'KSM' }, { Token: 'LKSM' }] },
      alice.address
    )
    const bal = balData.free

    const tx1 = await sendTransaction(
      dexRemoveLiquidity(karura.api, { Token: 'KSM' }, { Token: 'LKSM' }, bal, '0', '0', false).signAsync(alice, {
        nonce: 1,
      })
    )

    await karura.chain.newBlock()

    await checkEvents(tx1, {
      method: 'RemoveLiquidity',
      section: 'dex',
    }).toMatchSnapshot()
  })

  it('addLiquidity and stake works', async () => {
    const tx = await sendTransaction(
      addLiquidity(
        karura.api,
        { Token: 'KSM' },
        { Token: 'LKSM' },
        '1000000000000',
        '10000000000000',
        '0',
        true
      ).signAsync(alice, { nonce: 0 })
    )
    await karura.chain.newBlock()

    await checkEvents(tx, { method: 'AddLiquidity', section: 'dex' }).toMatchSnapshot()
    await check(
      querySharesAndWithdrawnRewards(
        karura.api,
        { Dex: { DexShare: [{ Token: 'KSM' }, { Token: 'LKSM' }] } },
        alice.address
      )
    )
      .redact()
      .toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { DexShare: [{ Token: 'KSM' }, { Token: 'LKSM' }] }, alice.address))
      .redact()
      .toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address))
      .redact()
      .toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { Token: 'LKSM' }, alice.address))
      .redact()
      .toMatchSnapshot()
  })
})
