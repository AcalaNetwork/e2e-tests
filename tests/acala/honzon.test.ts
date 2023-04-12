import { beforeEach, describe, it } from 'vitest'
import { sendTransaction, testingPairs } from '@acala-network/chopsticks-testing'

import { Network, createNetworks } from '../../networks'
import { acala, karura } from '../../networks/acala'
import { check, checkEvents, checkSystemEvents } from '../../helpers'

describe.each([
  {
    name: 'karura',
    relayToken: karura.ksm,
    stableToken: karura.ausd,
  },
  {
    name: 'acala',
    relayToken: acala.dot,
    stableToken: acala.ausd,
  },
] as const)('$name honzon', async ({ name, relayToken, stableToken }) => {
  const { alice } = testingPairs()
  let chain: Network

  beforeEach(async () => {
    const { [name]: chain1 } = await createNetworks({ [name]: undefined })
    chain = chain1

    await chain.dev.setStorage({
      Tokens: {
        accounts: [
          [[alice.address, { Token: relayToken }], { free: 100e12 }],
        ]
      }
    })

    return async () => await chain.teardown()
  })

  describe('with positions', () => {
    beforeEach(async () => {
      await sendTransaction(chain.api.tx.honzon.adjustLoan(relayToken, 50e12, 500e12).signAsync(alice))

      await chain.chain.newBlock()
    })

    it('honzon deposit and debit works', async () => {
      await checkSystemEvents(chain, { section: 'loans', method: 'PositionUpdated' }).toMatchSnapshot()
      await check(chain.api.query.tokens.accounts(alice.address, stableToken)).redact({ number: 1 }).toMatchSnapshot()
      await check(chain.api.query.loans.positions(relayToken, alice.address)).toMatchSnapshot()
    })

    it('honzon payback works', async () => {
      const tx = await sendTransaction(
        chain.api.tx.honzon.adjustLoanByDebitValue(relayToken, -50e12, -500e12).signAsync(alice)
      )

      await chain.chain.newBlock()

      await checkEvents(tx, { section: 'loans', method: 'PositionUpdated' }).toMatchSnapshot()
      await check(chain.api.query.tokens.accounts(alice.address, stableToken)).redact({ number: 1 }).toMatchSnapshot()
      await check(chain.api.query.loans.positions(relayToken, alice.address)).toMatchSnapshot()
    })

    it('loans by Dex close works', async () => {
      const tx1 = await sendTransaction(chain.api.tx.honzon.closeLoanHasDebitByDex(relayToken, 50e12).signAsync(alice))

      await chain.chain.newBlock()

      await checkEvents(
        tx1,
        { section: 'loans', method: 'PositionUpdated' },
        { section: 'cdpEngine', method: 'CloseCDPInDebitByDEX' }
      )
        .redact({ number: true })
        .toMatchSnapshot()
      await check(chain.api.query.loans.positions(relayToken, alice.address)).toMatchSnapshot()
    })
  })
})
