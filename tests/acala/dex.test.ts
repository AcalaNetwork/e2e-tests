import { afterAll, beforeEach, describe, it } from 'vitest'
import { sendTransaction, testingPairs } from '@acala-network/chopsticks-testing'

import { checkEvents } from '../../helpers'
import { createNetworks } from '../../networks'

import { acala, karura } from '../../networks/acala'
import { query } from '../../helpers/api'

describe.each([
  {
    name: 'karura',
    swapPair: [karura.ksm, karura.lksm],
  },
  {
    name: 'acala',
    swapPair: [acala.ausd, acala.ldot],
  },
] as const)('$name dex', async ({ name, swapPair }) => {
  const { [name]: chain } = await createNetworks({ [name]: undefined })
  const { alice } = testingPairs()

  const head = chain.chain.head

  afterAll(async () => {
    await chain.teardown()
  })

  beforeEach(async () => {
    await chain.chain.setHead(head)
  })

  it.each([
    {
      name: 'swapWithExactSupply',
      tx: chain.api.tx.dex.swapWithExactSupply(swapPair, 1e12, 0),
    },
    {
      name: 'swapWithExactTarget',
      tx: chain.api.tx.dex.swapWithExactTarget(swapPair, 1e12, 1e15),
    },
  ])('$name works', async ({ tx }) => {
    const tx0 = await sendTransaction(tx.signAsync(alice))

    await chain.chain.newBlock()

    await checkEvents(tx0, 'dex', 'tokens').redact({ number: true }).toMatchSnapshot()
  })

  it.each([true, false])('addLiquidity removeLiquidity works with stake %s', async (stake) => {
    const tx0 = await sendTransaction(
      chain.api.tx.dex.addLiquidity(swapPair[0], swapPair[1], 1e12, 1e13, 0, stake).signAsync(alice)
    )

    await chain.chain.newBlock()

    await checkEvents(tx0, 'dex', 'incentives', 'tokens').redact({ number: true }).toMatchSnapshot('addLiquidity')

    const lp: any = await query.tokens({ DexShare: swapPair })(chain, alice.address)

    const tx1 = await sendTransaction(
      chain.api.tx.dex.removeLiquidity(swapPair[0], swapPair[1], lp.free, 0, 0, stake).signAsync(alice)
    )

    await chain.chain.newBlock()

    await checkEvents(tx1, 'dex', 'incentives', 'tokens').redact({ number: true }).toMatchSnapshot('removeLiquidity')
  })
})
