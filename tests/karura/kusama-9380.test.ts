import { afterAll, beforeEach, describe, it } from 'vitest'
import { connectVertical } from '@acala-network/chopsticks'

import {
  forceBumpCurrentEra,
  mint,
  relayChainV3limitedReserveTransferAssets,
  requestRedeem,
  sudo,
  xTokens,
} from '../api/extrinsics'
import { matchEvents, matchJson, matchSystemEvents, matchUmp, sendTransaction, testingPairs } from '../helper'
import networks from '../networks'

describe('Karura <-> Kusama', async () => {
  const kusama = await networks.kusama({
    wasmOverride: './wasm/kusama_runtime-v9380.compact.compressed.wasm',
    blockNumber: 16732970,
  })
  const karura = await networks.karura({
    wasmOverride: './wasm/karura-2150.wasm',
    blockNumber: 3752729,
  })
  await connectVertical(kusama.chain, karura.chain)

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

  it('Karura transfer assets to Kusama', async () => {
    const tx = await sendTransaction(
      xTokens(karura.api, true, '', { Token: 'KSM' }, '1000000000000', alice.addressRaw).signAsync(alice)
    )

    await karura.chain.newBlock()

    matchJson(await karura.api.query.tokens.accounts(alice.address, { Token: 'KSM' }))

    await matchEvents(tx.events, 'xTokens')
    await matchUmp(karura)

    await kusama.chain.newBlock()

    matchJson(await kusama.api.query.system.account(alice.address))

    await matchSystemEvents(kusama, 'ump')
  })

  it('Kusama transfer assets to Karura', async () => {
    const tx = await sendTransaction(
      relayChainV3limitedReserveTransferAssets(kusama.api, '2000', '1000000000000', alice.addressRaw).signAsync(alice)
    )

    await kusama.chain.newBlock()

    await matchEvents(tx.events, 'xcmPallet')

    matchJson(await kusama.api.query.system.account(alice.address))

    await karura.chain.newBlock()

    matchJson(await karura.api.query.tokens.accounts(alice.address, { Token: 'KSM' }))

    await matchSystemEvents(karura, 'parachainSystem', 'dmpQueue')
  })

  it('Homa stake works', async () => {
    const tx0 = await sendTransaction(mint(karura.api, '1000000000000').signAsync(alice, { nonce: 0 }))
    const tx1 = await sendTransaction(
      sudo(karura.api, forceBumpCurrentEra(karura.api, '0')).signAsync(alice, { nonce: 1 })
    )

    await karura.chain.newBlock()

    await matchEvents(tx0.events, 'homa')
    await matchEvents(tx1.events, { section: 'homa', method: 'CurrentEraBumped' })
    await matchUmp(karura)

    await kusama.chain.newBlock()

    await matchSystemEvents(kusama, 'ump', 'staking')
  })

  it('Homa redeem unbond works', async () => {
    const tx0 = await sendTransaction(requestRedeem(karura.api, '1000000000000', false).signAsync(alice, { nonce: 0 }))
    const tx1 = await sendTransaction(
      sudo(karura.api, forceBumpCurrentEra(karura.api, '0')).signAsync(alice, { nonce: 1 })
    )

    await karura.chain.newBlock()

    await matchEvents(tx0.events, { section: 'homa', method: 'RequestedRedeem' })
    await matchEvents(tx1.events, { section: 'homa', method: 'RedeemedByUnbond' })

    await kusama.chain.newBlock()
    await matchSystemEvents(kusama, 'ump', 'staking')
  })

  it('Homa unbond withdraw works', async () => {
    //Set the relaychain number in advance, Kusama Block Number: 16732970, Karura Block Number: 3752729
    const tx = await sendTransaction(sudo(karura.api, forceBumpCurrentEra(karura.api, '1')).signAsync(alice))
    await karura.chain.newBlock()
    await matchEvents(tx.events, { section: 'homa', method: 'CurrentEraBumped' })

    await kusama.chain.newBlock()
    await matchSystemEvents(kusama, 'ump', 'staking')
    // await matchSystemEvents(kusama, { section: 'staking', method: 'withdrawUnbonded' })
  })
})
