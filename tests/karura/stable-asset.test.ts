import { afterAll, beforeEach, describe, it } from 'vitest'

import { check, checkEvents, checkSystemEvents, sendTransaction, testingPairs } from '../helper'
import { queryTokenBalance } from '../api/query'
import {
  stableAssetMint,
  stableAssetRedeemProportion,
  stableAssetRedeemSingle,
  stableAssetSwap,
  swapWithExactTarget,
} from '../api/extrinsics'
import networks, { Network } from '../networks'

describe('Karura dex', async () => {
  let karura: Network

  const { alice } = testingPairs()

  beforeEach(async () => {
    karura = await networks.karura()
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

    return async () => await karura.teardown()
  })

  it('stable swap works', async () => {
    const tx0 = await sendTransaction(
      swapWithExactTarget(
        karura.api,
        [{ Token: 'KSM' }, { Token: 'KUSD' }],
        '1000000000000',
        '10000000000000'
      ).signAsync(alice)
    )

    await karura.chain.newBlock()

    await checkEvents(tx0, 'dex').redact({ number: 1 }).toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address))
      .redact()
      .toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address))
      .redact()
      .toMatchSnapshot()

    const tx1 = await sendTransaction(
      stableAssetSwap(karura.api, '1', '0', '2', '1000000000000', '0', '3').signAsync(alice)
    )
    await karura.chain.newBlock()

    await checkEvents(tx1, 'stableAsset').redact({ number: 1 }).toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { Token: 'KUSD' }, alice.address))
      .redact()
      .toMatchSnapshot()
    await check(queryTokenBalance(karura.api, { ForeignAsset: '7' }, alice.address))
      .redact()
      .toMatchSnapshot()
  })

  describe('with liquidity', () => {
    beforeEach(async () => {
      await sendTransaction(
        stableAssetMint(karura.api, '0', ['1000000000000', '10000000000000'], '0').signAsync(alice, { nonce: 0 })
      )

      await karura.chain.newBlock()
    })

    it('mint works', async () => {
      await checkSystemEvents(karura, 'stableAsset').redact({ number: 1 }).toMatchSnapshot()

      await check(queryTokenBalance(karura.api, { StableAssetPoolToken: '0' }, alice.address))
        .redact()
        .toMatchSnapshot()
      await check(queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address))
        .redact()
        .toMatchSnapshot()
      await check(queryTokenBalance(karura.api, { Token: 'LKSM' }, alice.address))
        .redact()
        .toMatchSnapshot()
    })

    it('stableAssetRedeemSingle works', async () => {
      const balData: any = await queryTokenBalance(karura.api, { StableAssetPoolToken: '0' }, alice.address)

      const tx = await sendTransaction(
        stableAssetRedeemSingle(karura.api, '0', balData.free, '0', '0', '2').signAsync(alice)
      )

      await karura.chain.newBlock()

      await checkEvents(tx, 'stableAsset').toMatchSnapshot()
      await check(queryTokenBalance(karura.api, { StableAssetPoolToken: '0' }, alice.address))
        .redact()
        .toMatchSnapshot()
      await check(queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address))
        .redact()
        .toMatchSnapshot()
    })

    it('redeemProportion works', async () => {
      const balData: any = await queryTokenBalance(karura.api, { StableAssetPoolToken: '0' }, alice.address)

      const tx1 = await sendTransaction(stableAssetRedeemProportion(karura.api, '0', balData.free, [0, 0]).signAsync(alice))

      await karura.chain.newBlock()

      await checkEvents(tx1, 'stableAsset').toMatchSnapshot()
      await check(queryTokenBalance(karura.api, { StableAssetPoolToken: '0' }, alice.address)).toMatchSnapshot()
      await check(queryTokenBalance(karura.api, { Token: 'KSM' }, alice.address))
        .redact()
        .toMatchSnapshot()
      await check(queryTokenBalance(karura.api, { Token: 'LKSM' }, alice.address))
        .redact()
        .toMatchSnapshot()
    })
  })
})
