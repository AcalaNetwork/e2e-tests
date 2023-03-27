import { afterAll, beforeEach, describe, it } from 'vitest'
import { connectVertical } from '@acala-network/chopsticks'

import { check, checkEvents, checkSystemEvents, checkUmp, sendTransaction, testingPairs } from '../helper'
import {
  forceBumpCurrentEra,
  mint,
  relayChainV3limitedReserveTransferAssets,
  requestRedeem,
  sudo,
  xTokensV3,
} from '../api/extrinsics'
import networks from '../networks'

describe('Karura <-> Kusama', async () => {
  const kusama = await networks.kusama({
    wasmOverride: './wasm/kusama_runtime-v9381.compact.compressed.wasm',
  })
  const karura = await networks.karura({
    wasmOverride: './wasm/karura-2160-dev.wasm',
  })
  await connectVertical(kusama.chain, karura.chain)

  await karura.dev.newBlock()
  await kusama.dev.newBlock()

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
      ParasDisputes: {
        // those can makes block building super slow
        $removePrefix: ['disputes'],
      },
    })
  })

  it('Karura transfer assets to Kusama', async () => {
    const tx = await sendTransaction(
      xTokensV3(karura.api, true, '', { Token: 'KSM' }, '1000000000000', alice.addressRaw).signAsync(alice)
    )

    await karura.chain.newBlock()

    await check(karura.api.query.tokens.accounts(alice.address, { Token: 'KSM' })).toMatchSnapshot()

    await checkEvents(tx, 'xTokens').toMatchSnapshot()
    await checkUmp(karura).toMatchSnapshot()

    await kusama.chain.newBlock()

    await check(kusama.api.query.system.account(alice.address)).toMatchSnapshot()

    await checkSystemEvents(kusama, 'ump').toMatchSnapshot()
  })

  it('Kusama transfer assets to Karura', async () => {
    const tx = await sendTransaction(
      relayChainV3limitedReserveTransferAssets(kusama.api, '2000', '1000000000000', alice.addressRaw).signAsync(alice)
    )

    await kusama.chain.newBlock()

    await checkEvents(tx, 'xcmPallet').toMatchSnapshot()
    await check(kusama.api.query.system.account(alice.address)).toMatchSnapshot()

    await karura.chain.newBlock()

    await check(karura.api.query.tokens.accounts(alice.address, { Token: 'KSM' }))
      .redact()
      .toMatchSnapshot()
    await checkSystemEvents(karura, 'parachainSystem', 'dmpQueue').toMatchSnapshot()
  })

  it('Homa stake works', async () => {
    const tx0 = await sendTransaction(mint(karura.api, '1000000000000').signAsync(alice, { nonce: 0 }))
    const tx1 = await sendTransaction(
      sudo(karura.api, forceBumpCurrentEra(karura.api, '0')).signAsync(alice, { nonce: 1 })
    )

    await karura.chain.newBlock()

    await checkEvents(tx0, 'homa').toMatchSnapshot()
    await checkEvents(tx1, { section: 'homa', method: 'CurrentEraBumped' }).toMatchSnapshot()
    await checkUmp(karura).redact({ number: true, hex: true }).toMatchSnapshot()

    await kusama.chain.newBlock()

    await checkSystemEvents(kusama, 'ump', 'staking').redact({ address: true, number: true }).toMatchSnapshot()
  })

  it('Homa redeem unbond works', async () => {
    const tx0 = await sendTransaction(requestRedeem(karura.api, '1000000000000', false).signAsync(alice, { nonce: 0 }))
    const tx1 = await sendTransaction(
      sudo(karura.api, forceBumpCurrentEra(karura.api, '0')).signAsync(alice, { nonce: 1 })
    )

    await karura.chain.newBlock()

    await checkEvents(tx0, { section: 'homa', method: 'RequestedRedeem' }).toMatchSnapshot()
    await checkEvents(tx1, { section: 'homa', method: 'RedeemedByUnbond' }).toMatchSnapshot()

    await kusama.chain.newBlock()

    await checkSystemEvents(kusama, 'ump', 'staking').redact({ address: true }).toMatchSnapshot()
  })
})

describe('Karura 3752729 <-> Kusama 16732970', async () => {
  const kusama = await networks.kusama({
    wasmOverride: './wasm/kusama_runtime-v9381.compact.compressed.wasm',
    blockNumber: 16732970,
  })
  const karura = await networks.karura({
    wasmOverride: './wasm/karura-2160-dev.wasm',
    blockNumber: 3752729,
  })
  await connectVertical(kusama.chain, karura.chain)

  await karura.dev.newBlock()
  await kusama.dev.newBlock()

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

  it('Homa unbond withdraw works', async () => {
    //Set the relaychain number in advance, Kusama Block Number: 16732970, Karura Block Number: 3752729
    const tx = await sendTransaction(sudo(karura.api, forceBumpCurrentEra(karura.api, '1')).signAsync(alice))
    await karura.chain.newBlock()
    await checkEvents(tx, { section: 'homa', method: 'CurrentEraBumped' }).toMatchSnapshot()
    //
    await kusama.chain.newBlock()
    await checkSystemEvents(kusama, 'ump', {
      method: 'Withdrawn',
      section: 'staking',
    }).toMatchSnapshot()
  })
})
