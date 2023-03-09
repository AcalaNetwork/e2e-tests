import { beforeEach, describe, it } from 'vitest'
import { connectParachains } from '@acala-network/chopsticks'

import { expectJson, matchEvents, matchHrmp, matchSystemEvents, sendTransaction, testingPairs } from '../helper'
import { xTokens } from '../api/extrinsics'
import networks, { Network } from '../networks'

describe('Karura <-> Basilisk', async () => {
  let basilisk: Network
  let karura: Network

  const { alice } = testingPairs()

  beforeEach(async () => {
    basilisk = await networks.basilisk()
    karura = await networks.karura()
    await connectParachains([basilisk.chain, karura.chain])

    await karura.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
      Tokens: {
        Accounts: [
          [[alice.address, { Token: 'KSM' }], { free: 10 * 1e12 }],
          [[alice.address, { Token: 'AUSD' }], { free: 10 * 1e12 }],
        ],
      },
      Sudo: {
        Key: alice.address,
      },
    })
    await basilisk.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
    })

    return async () => {
      await basilisk.teardown()
      await karura.teardown()
    }
  })

  it('Karura transfer DAI to basilisk', async () => {
    const DAI = '0x4bb6afb5fa2b07a5d1c499e1c3ddb5a15e709a71'
    const tx0 = await sendTransaction(
      karura.api.tx.sudo
        .sudoAs(
          'rPWzRkpPjuceq6Po91sfHLZJ9wo6wzx4PAdjUH91ckv81nv',
          karura.api.tx.currencies.transfer(alice.address, { Erc20: DAI }, '1000000000000000000')
        )
        .signAsync(alice, { nonce: 0 })
    )

    await karura.chain.newBlock()

    await matchEvents(tx0.events, 'currencies')

    const tx1 = await sendTransaction(
      xTokens(karura.api, false, '2090', { Erc20: DAI }, '1000000000000000000', alice.addressRaw).signAsync(alice)
    )

    await karura.chain.newBlock()

    await matchEvents(tx1.events, 'xTokens', 'xcmpQueue', 'evm')
    await matchHrmp(karura)

<<<<<<< HEAD
    // await basilisk.chain.newBlock({ timeout: 1000 })
    // expectJson(await basilisk.api.query.tokens.accounts(alice, '13')).toMatchInlineSnapshot(`
=======
    //   await basilisk.chain.upcomingBlock()
    //   expectJson(await basilisk.api.query.tokens.accounts(alice, '13')).toMatchInlineSnapshot(`
>>>>>>> origin/master
    //   {
    //     "free": 1000000000000000000,
    //     "frozen": 0,
    //     "reserved": 0,
    //   }
    // `)
  })

  it('Karura transfer USDC to basilisk', async () => {
    const USDC = '0x1f3a10587a20114ea25ba1b388ee2dd4a337ce27'
    const tx0 = await sendTransaction(
      karura.api.tx.sudo
        .sudoAs(
          'r7ts9D2xjiWoPhdnSLe3id9MAT5MADP8bBg17zP9aqRcKvj',
          karura.api.tx.currencies.transfer(alice.address, { Erc20: USDC }, '1000000')
        )
        .signAsync(alice, { nonce: 0 })
    )

    await karura.chain.newBlock()

    await matchEvents(tx0.events, 'currencies')

    const tx1 = await sendTransaction(
      xTokens(karura.api, false, '2090', { Erc20: USDC }, '1000000', alice.addressRaw).signAsync(alice)
    )

    await karura.chain.newBlock()

    await matchEvents(tx1.events, 'xTokens', 'xcmpQueue', 'evm')
    await matchHrmp(karura)

    await basilisk.chain.newBlock()
    expectJson(await basilisk.api.query.tokens.accounts(alice.address, '9')).toMatchInlineSnapshot(`
      {
        "free": 995600,
        "frozen": 0,
        "reserved": 0,
      }
    `)

    await matchSystemEvents(basilisk, 'xcmpQueue', 'tokens')
  })
})
