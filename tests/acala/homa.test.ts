import { afterAll, beforeEach, describe, it } from 'vitest'
import { connectVertical } from '@acala-network/chopsticks'
import { sendTransaction, testingPairs } from '@acala-network/chopsticks-testing'

import { checkEvents, checkSystemEvents, checkUmp } from '../../helpers'
import { forceBumpCurrentEra, mint, requestRedeem, sudo } from '../../helpers/api/extrinsics'
import networks, { Network } from '../../networks'

describe('Karura <-> Kusama', async () => {
  let kusama: Network
  let karura: Network

  const { alice } = testingPairs()

  beforeEach(async () => {
    kusama = await networks.kusama({
      wasmOverride: './wasm/kusama_runtime-v9381.compact.compressed.wasm',
    })
    karura = await networks.karura()
    await connectVertical(kusama.chain, karura.chain)

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
      Homa: {
        // avoid impact test outcome
        $removePrefix: ['redeemRequests', 'unbondings', 'toBondPool'],
        // so that bump era won't trigger unbond
        relayChainCurrentEra: '0x64000000',
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

    // new block to run migration
    await kusama.dev.newBlock()
    await karura.dev.newBlock()

    return async () => {
      await kusama.teardown()
      await karura.teardown()
    }
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

  it('Homa unbond withdraw works', async () => {
    //Set the relaychain number in advance, Kusama Block Number: 16732970, Karura Block Number: 3752729
    const tx = await sendTransaction(sudo(karura.api, forceBumpCurrentEra(karura.api, '1')).signAsync(alice))
    await karura.chain.newBlock()
    await checkEvents(tx, { section: 'homa', method: 'CurrentEraBumped' }).toMatchSnapshot()

    await kusama.chain.newBlock()
    await checkSystemEvents(kusama, 'ump', 'staking').toMatchSnapshot()
  })
})
