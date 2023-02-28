import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { connectParachains } from '@acala-network/chopsticks'

import { expectEvent, expectExtrinsicSuccess, expectJson, sendTransaction, testingPairs } from '../helper'
import networks from '../networks'

describe('Karura <-> Basilisk', async () => {
  const basilisk = await networks.basilisk()
  const karura = await networks.karura()
  await connectParachains([basilisk.chain, karura.chain])

  const { alice } = testingPairs()

  afterAll(async () => {
    await basilisk.teardown()
    await karura.teardown()
  })

  beforeEach(async () => {
    await karura.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]]
      },
      Tokens: {
        Accounts: [
          [[alice.address, { Token: 'KSM' }], { free: 10 * 1e12 }],
          [[alice.address, { Token: 'AUSD' }], { free: 10 * 1e12 }]
        ]
      },
      Sudo: {
        Key: alice.address
      }
    })
    await basilisk.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]]
      }
    })
  })

  it('0. Karura transfer DAI to basilisk', async () => {
    const DAI = "0x4bb6afb5fa2b07a5d1c499e1c3ddb5a15e709a71"
    const tx0 = await sendTransaction(
      karura.api.tx.sudo.sudoAs("rPWzRkpPjuceq6Po91sfHLZJ9wo6wzx4PAdjUH91ckv81nv", karura.api.tx.currencies.transfer(alice.address, { Erc20: DAI }, "1000000000000000000"))
        .signAsync(alice))

    await karura.chain.newBlock()
    expectExtrinsicSuccess(await tx0.events)

    console.dir((await tx0.events).map(x => x.toHuman()), { depth: null })
    expectEvent(await tx0.events, {
      event: expect.objectContaining({
        section: 'evmAccounts',
        method: 'ClaimAccount'
      })
    })
    //
    expectEvent(await tx0.events, {
      event: expect.objectContaining({
        section: 'currencies',
        method: 'Transferred'
      })
    })
    //
    // const tx1 = await sendTransaction(
    //   karura.api.tx.xTokens
    //     .transfer(
    //       {
    //         Erc20: DAI
    //       },
    //       10 ** 18,
    //       {
    //         V1: {
    //           parents: 1,
    //           interior: {
    //             X2: [
    //               {
    //                 Parachain: '2090'
    //               },
    //               {
    //                 AccountId32: {
    //                   network: 'Any',
    //                   id: alice.addressRaw
    //                 }
    //               }
    //             ]
    //           }
    //         }
    //       },
    //       'Unlimited'
    //     )
    //     .signAsync(alice)
    // )
    //
    // await karura.chain.newBlock()
    // await basilisk.chain.upcomingBlock()
    // expectExtrinsicSuccess(await tx1.events)

  })
})
