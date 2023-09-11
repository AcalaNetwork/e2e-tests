import { beforeEach, describe, it } from 'vitest'
import { check, checkSystemEvents, checkUmp, sendTransaction } from '@acala-network/chopsticks-testing'

import { Network, createContext, createNetworks } from '../../networks'
import { checkEvents } from '../../helpers'

import { acala } from '../../networks/acala'

describe('liquid crowdloan', async () => {
  let chain: Network
  let relaychain: Network
  const crowdloanVault = '132zsjMwGjNaUXF5XjUCDs2cDEq9Qao51TsL9RSUTGZbinVK'
  const palletAccount = '23M5ttkmR6KcoCwfEJnoAgczRQdDq85ZedwGc3uzyPwiCoq8'
  const totalLcdot = 241161597502735335n

  const ctx = createContext()
  const { alice } = ctx

  beforeEach(async () => {
    const { acalaNext, polkadot } = await createNetworks({ acalaNext: undefined, polkadot: undefined }, ctx)
    chain = acalaNext
    relaychain = polkadot

    // assume the crowdloan fund is returned
    await relaychain.dev.setStorage({
      System: {
        Account: [[[crowdloanVault], { providers: 1, data: { free: 24116165n * 10n ** 10n } }]],
      },
    })

    await chain.dev.setStorage({
      Tokens: {
        Accounts: [
          [[alice.address, acala.lcdot], { free: 1000 * 1e10 }],
        ]
      }
    })

    await relaychain.dev.newBlock({
      unsafeBlockHeight: 17_856_000,
      count: 2,
    } as any)

    return async () => chain.teardown()
  })

  it('works', async () => {
    await sendTransaction(chain.api.tx.sudo.sudo(chain.api.tx.xcmInterface.updateXcmDestWeightAndFee([[
      'ProxyReserveTransferAssets',
      {
        refTime: 50e9,
        proofSize: 128 * 1024
      },
      2e10
    ]] as any)).signAsync(alice))
    await chain.dev.newBlock()

    await sendTransaction(chain.api.tx.sudo.sudo(chain.api.tx.liquidCrowdloan.transferFromCrowdloanVault(10 * 10e10)).signAsync(alice))
    await chain.dev.newBlock()

    await checkUmp(chain).toMatchSnapshot()

    await relaychain.dev.newBlock()

    await checkSystemEvents(relaychain, 'messageQueue', 'xcmPallet', 'proxy', 'balances').toMatchSnapshot()

    await chain.dev.newBlock()

    await check(chain.api.query.tokens.accounts(palletAccount, acala.dot)).toMatchSnapshot('pallet account balance')

    const tx0 = await sendTransaction(chain.api.tx.liquidCrowdloan.redeem(9 * 10e10).signAsync(alice))

    await chain.dev.newBlock()

    await checkEvents(tx0, 'liquidCrowdloan').toMatchSnapshot('first redeem')

    await sendTransaction(chain.api.tx.sudo.sudo(chain.api.tx.liquidCrowdloan.transferFromCrowdloanVault(totalLcdot - 2000n * 10n ** 10n)).signAsync(alice))

    await chain.dev.newBlock()

    await checkUmp(chain).toMatchSnapshot('after all transfer ump')

    await relaychain.dev.newBlock()

    await checkSystemEvents(relaychain, 'messageQueue', 'xcmPallet', 'proxy', 'balances').toMatchSnapshot('after all transfer relaychain events')

    await chain.dev.newBlock()

    await check(chain.api.query.tokens.accounts(palletAccount, acala.dot)).toMatchSnapshot('pallet account balance after all transfer')

    const tx1 = await sendTransaction(chain.api.tx.liquidCrowdloan.redeem(400 * 1e10).signAsync(alice))

    await chain.dev.newBlock()

    await checkEvents(tx1, 'liquidCrowdloan').toMatchSnapshot('second redeem')
  })
})
