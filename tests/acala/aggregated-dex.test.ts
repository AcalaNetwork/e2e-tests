import { afterEach, beforeEach, describe, it } from 'bun:test'
import { bnToHex } from '@polkadot/util'
import { sendTransaction } from '@acala-network/chopsticks-testing'

import { Network, createContext, createNetworks } from '../../networks'
import { checkEvents } from '../../helpers'

import { acala, karura } from '../../networks/acala'

for (const { name, swapPath } of [
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
] as const) {
  describe(`${name} aggregatedDex'`, () => {
    let chain: Network

    const ctx = createContext()
    const { alice } = ctx

    beforeEach(async () => {
      const { [name]: chain1 } = await createNetworks({ [name]: undefined }, ctx)
      chain = chain1

      // restore Homa.toBondPool to correct liquid token exchange rate
      const apiAt = await chain.api.at(await chain.api.rpc.chain.getBlockHash(chain.chain.head.number - 3))
      const toBondPool: bigint = ((await apiAt.query.homa.toBondPool()) as any).toBigInt()
      await chain.dev.setStorage({
        Homa: {
          toBondPool: bnToHex(toBondPool + 10n * 10n ** 10n, { bitLength: 128, isLe: true }),
        },
      })
    })

    afterEach(async () => {
      console.log('teardown')
      await chain.teardown()
    })

    it('swapWithExactSupply', async () => {
      const tx = await sendTransaction(
        chain.api.tx.aggregatedDex.swapWithExactSupply(swapPath as any, 1e12, 0).signAsync(alice),
      )

      await chain.chain.newBlock()

      await checkEvents(tx, 'dex').redact({ number: true }).toMatchSnapshot()
    }, 120000)
  })
}
