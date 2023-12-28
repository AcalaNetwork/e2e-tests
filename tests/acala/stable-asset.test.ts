import { beforeEach, describe, it } from 'bun:test'
import { bnToHex } from '@polkadot/util'
import { sendTransaction } from '@acala-network/chopsticks-testing'

import { Network, createContext, createNetworks } from '../../networks'
import { checkEvents, checkSystemEvents } from '../../helpers'
import { query } from '../../helpers/api'

for (const name of ['karura', 'acala'] as const) {
  describe(`${name} stable asset`, async () => {
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

      return async () => chain.teardown()
    })

    it('swap', async () => {
      const tx0 = await sendTransaction(chain.api.tx.stableAsset.swap(0, 0, 1, 1e12, 1e11, 2).signAsync(alice))

      await chain.chain.newBlock()

      await checkEvents(tx0, { section: 'stableAsset', method: 'TokenSwapped' })
        .redact({ number: true })
        .toMatchSnapshot()
    })

    describe('with liquidity', () => {
      beforeEach(async () => {
        await sendTransaction(chain.api.tx.stableAsset.mint(0, [1e12, 1e12], 0).signAsync(alice))

        await chain.chain.newBlock()
      })

      it('mint', async () => {
        await checkSystemEvents(chain, { section: 'stableAsset', method: 'Minted' })
          .redact({ number: true })
          .toMatchSnapshot()
      })

      for (const { tx, event, name } of [
        {
          name: 'redeemSingle',
          tx: (x: any) => chain.api.tx.stableAsset.redeemSingle(0, x, 0, 0, 2),
          event: 'RedeemedSingle',
        },
        {
          name: 'redeemProportion',
          tx: (x: any) => chain.api.tx.stableAsset.redeemProportion(0, x, [0, 0]),
          event: 'RedeemedProportion',
        },
      ] as const) {
        it(
          name,
          async () => {
            const balData: any = await query.tokens({ StableAssetPoolToken: 0 })(chain, alice.address)

            const tx0 = await sendTransaction(tx(balData.free).signAsync(alice))

            await chain.chain.newBlock()

            await checkEvents(tx0, { section: 'stableAsset', method: event }).redact({ number: true }).toMatchSnapshot()
          },
          120000,
        )
      }
    })

    it('mint overflow', async () => {
      const mintAmount = 68056473384187692692674921486353642291n
      const tx0 = await sendTransaction(chain.api.tx.stableAsset.mint(0, [0, mintAmount], 0).signAsync(alice))

      await chain.chain.newBlock()

      await checkEvents(tx0, 'system').toMatchSnapshot()
    })

    it('swap overflow', async () => {
      const swapAmount = 68056473384187692692674921486353642291n
      const tx0 = await sendTransaction(chain.api.tx.stableAsset.swap(0, 1, 0, swapAmount, 0, 2).signAsync(alice))

      await chain.chain.newBlock()

      await checkEvents(tx0, 'system').toMatchSnapshot()
    })
  })
}
