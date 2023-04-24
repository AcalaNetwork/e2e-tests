import { afterAll, beforeEach, describe, it } from 'vitest'
import { sendTransaction, testingPairs } from '@acala-network/chopsticks-testing'

import { checkEvents } from '../../helpers'
import { createNetworks } from '../../networks'

import { acala, karura } from '../../networks/acala'

describe.each([
  {
    name: 'karura',
    swapPath: [
      {
        Dex: [karura.ksm, karura.rmrk, karura.ausd],
      },
      {
        Taiga: [1, 0, 2],
      },
    ],
  },
  {
    name: 'acala',
    swapPath: [
      {
        Dex: [acala.aca, acala.ausd, acala.ldot],
      },
      {
        Taiga: [0, 1, 0],
      },
    ],
  },
] as const)('$name aggregatedDex', async ({ name, swapPath }) => {
  const { [name]: chain } = await createNetworks({ [name]: undefined })
  const { alice } = testingPairs()

  const head = chain.chain.head

  afterAll(async () => {
    await chain.teardown()
  })

  beforeEach(async () => {
    await chain.chain.setHead(head)
  })

  it('swapWithExactSupply', async () => {
    const tx = await sendTransaction(
      chain.api.tx.aggregatedDex.swapWithExactSupply(swapPath, 1e12, 0).signAsync(alice, { nonce: 0 })
    )

    await chain.chain.newBlock()

    await checkEvents(tx, 'dex').redact({ number: true }).toMatchSnapshot()
  })
})
