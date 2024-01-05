import { sendTransaction, testingPairs } from '@acala-network/chopsticks-testing'

import { checkEvents, jest } from '../../helpers'
import { createNetworks } from '../../networks'

import { acala, karura } from '../../networks/acala'
import { query } from '../../helpers/api'

const { beforeEach, afterAll, describe, it } = jest(import.meta.path)

for (const { name, swapPair } of [
  {
    name: 'karura',
    swapPair: [karura.ksm, karura.lksm],
  },
  {
    name: 'acala',
    swapPair: [acala.ausd, acala.ldot],
  },
] as const) {
  describe(`${name} dex`, async () => {
    const { [name]: chain } = await createNetworks({ [name]: undefined })
    const { alice } = testingPairs()

    const head = chain.chain.head

    afterAll(async () => {
      await chain.teardown()
    })

    beforeEach(async () => {
      await chain.chain.setHead(head)
    })

    for (const { name, tx } of [
      {
        name: 'swapWithExactSupply',
        tx: chain.api.tx.dex.swapWithExactSupply(swapPair as any, 1e12, 0),
      },
      {
        name: 'swapWithExactTarget',
        tx: chain.api.tx.dex.swapWithExactTarget(swapPair as any, 1e12, 1e15),
      },
    ]) {
      it(`${name} works`, async () => {
        const tx0 = await sendTransaction(tx.signAsync(alice))

        await chain.chain.newBlock()

        await checkEvents(tx0, 'dex', 'tokens').redact({ number: true }).toMatchSnapshot()
      })
    }

    for (const stake of [true, false]) {
      it(`addLiquidity removeLiquidity works with stake ${stake}`, async () => {
        const tx0 = await sendTransaction(
          chain.api.tx.dex.addLiquidity(swapPair[0], swapPair[1], 1e12, 1e13, 0, stake).signAsync(alice),
        )

        await chain.chain.newBlock()

        await checkEvents(tx0, 'dex', 'incentives', 'tokens').redact({ number: true }).toMatchSnapshot('addLiquidity')

        let lpAmount
        if (stake) {
          lpAmount = (
            await chain.api.query.rewards.sharesAndWithdrawnRewards({ Dex: { DexShare: swapPair } }, alice.address)
          )[0]
        } else {
          lpAmount = ((await query.tokens({ DexShare: swapPair })(chain, alice.address)) as any).free
        }

        const tx1 = await sendTransaction(
          chain.api.tx.dex.removeLiquidity(swapPair[0], swapPair[1], lpAmount, 0, 0, stake).signAsync(alice),
        )

        await chain.chain.newBlock()

        await checkEvents(tx1, 'dex', 'incentives', 'tokens')
          .redact({ number: true })
          .toMatchSnapshot('removeLiquidity')
      })
    }
  })
}
