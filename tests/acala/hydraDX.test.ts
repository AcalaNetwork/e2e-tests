import { beforeEach, describe, expect, it } from 'vitest'
import { connectParachains } from '@acala-network/chopsticks'

import { checkEvents, checkHrmp, checkSystemEvents, sendTransaction, testingPairs } from '../helper'
import { xTokens } from '../api/extrinsics'
import networks, { Network } from '../networks'

describe('Acala <-> HydraDX', () => {
  let hydraDX: Network
  let acala: Network

  const { alice } = testingPairs()

  beforeEach(async () => {
    hydraDX = await networks.hydraDX({ blockNumber: 2136151 })
    acala = await networks.acala({ blockNumber: 3143845 })
    await connectParachains([hydraDX.chain, acala.chain])

    await acala.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
      Tokens: {
        Accounts: [
          [[alice.address, { Token: 'DOT' }], { free: 10 * 1e12 }],
          [[alice.address, { Token: 'AUSD' }], { free: 10 * 1e12 }],
        ],
      },
      Sudo: {
        Key: alice.address,
      },
    })
    await hydraDX.dev.setStorage({
      System: {
        Account: [[[alice.address], { data: { free: 1000 * 1e12 } }]],
      },
    })

    return async () => {
      await hydraDX.teardown()
      await acala.teardown()
    }
  })

  it('Acala transfer DAI to hydraDX', async () => {
    const DAI = '0x54a37a01cd75b616d63e0ab665bffdb0143c52ae'
    const tx0 = await sendTransaction(
      acala.api.tx.sudo
        .sudoAs(
          'zvX8kCdZvWwuGdKgePE6tPa4wgJnxiJsvM4CkC4kZ9QE6Hp',
          acala.api.tx.currencies.transfer(alice.address, { Erc20: DAI }, '1000000000000000000')
        )
        .signAsync(alice, { nonce: 0 })
    )

    await acala.chain.newBlock()

    await checkEvents(tx0, 'ClaimAccount', 'currencies').toMatchSnapshot()

    const tx1 = await sendTransaction(
      xTokens(acala.api, false, '2034', { Erc20: DAI }, '1000000000000000000', alice.addressRaw).signAsync(alice, {
        nonce: 1,
      })
    )

    await acala.chain.newBlock()

    await checkEvents(tx1, 'xTokens', 'xcmpQueue', 'evm').toMatchSnapshot()
    await checkHrmp(acala).toMatchSnapshot()

    await hydraDX.chain.newBlock()
    expect((await hydraDX.api.query.tokens.accounts(alice.address, '13')).toHuman()).toMatchInlineSnapshot(`
      {
        "free": "0",
        "frozen": "0",
        "reserved": "0",
      }
    `)
  })

  it('hydraDX tranfer DAI to acala', async () => {
    const DAI = '0x54a37a01cd75b616d63e0ab665bffdb0143c52ae'
    const tx0 = await sendTransaction(
      acala.api.tx.sudo
        .sudoAs(
          'zvX8kCdZvWwuGdKgePE6tPa4wgJnxiJsvM4CkC4kZ9QE6Hp',
          acala.api.tx.currencies.transfer(alice.address, { Erc20: DAI }, '1000000000000000000')
        )
        .signAsync(alice, { nonce: 0 })
    )

    await acala.chain.newBlock()

    await checkEvents(tx0, 'ClaimAccount', 'currencies').toMatchSnapshot()

    const tx1 = await sendTransaction(
      xTokens(acala.api, false, '2034', { Erc20: DAI }, '1000000000000000000', alice.addressRaw).signAsync(alice, {
        nonce: 1,
      })
    )

    await acala.chain.newBlock()

    await checkEvents(tx1, 'xTokens', 'xcmpQueue', 'evm').toMatchSnapshot()
    await checkHrmp(acala).toMatchSnapshot()

    await hydraDX.chain.newBlock()
    expect((await hydraDX.api.query.tokens.accounts(alice.address, '13')).toHuman()).toMatchInlineSnapshot(`
      {
        "free": "0",
        "frozen": "0",
        "reserved": "0",
      }
    `)

    await hydraDX.api.tx.xTokens
      .transfer(
        '13',
        '995600000000000000',
        {
          V1: {
            parents: 1,
            interior: {
              X2: [
                {
                  Parachain: '2000',
                },
                {
                  AccountId32: {
                    network: 'Any',
                    id: alice.addressRaw,
                  },
                },
              ],
            },
          },
        },
        '5000000000'
      )
      .signAndSend(alice)
    await hydraDX.chain.newBlock()
    expect((await hydraDX.api.query.tokens.accounts(alice.address, '13')).toHuman()).toMatchInlineSnapshot(`
      {
        "free": "0",
        "frozen": "0",
        "reserved": "0",
      }
    `)

    await acala.chain.newBlock()
    await checkSystemEvents(acala, 'xcmpQueue', 'evm', 'Executed').toMatchSnapshot()
  })
})
