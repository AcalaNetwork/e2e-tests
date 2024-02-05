import { afterAll, beforeAll, describe, it } from 'vitest'
import { sendTransaction } from '@acala-network/chopsticks-testing'

import { Network, createContext, createNetworks } from '../../networks'
import { acala, karura } from '../../networks/acala'
import { checkEvents } from '../../helpers'

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
  let chain: Network
  const ctx = createContext()
  const { alice } = ctx

  beforeAll(async () => {
    const networks = await createNetworks({ [name]: undefined }, ctx)
    chain = networks[name]

    // restore Homa.toBondPool to correct liquid token exchange rate
    const apiAt = await chain.api.at(await chain.api.rpc.chain.getBlockHash(chain.chain.head.number - 3))
    const toBondPool: bigint = ((await apiAt.query.homa.toBondPool()) as any).toBigInt()
    await chain.dev.setStorage({
      Homa: {
        toBondPool: toBondPool + 10n * 10n ** 10n,
      },
    })
  })

  afterAll(async () => {
    await chain.teardown()
  })

  it('swapWithExactSupply', async () => {
    const tx = await sendTransaction(
      chain.api.tx.aggregatedDex.swapWithExactSupply(swapPath as any, 1e12, 0).signAsync(alice),
    )

    await chain.chain.newBlock()

    await checkEvents(tx, 'dex').redact({ number: true }).toMatchSnapshot()
  })
})
