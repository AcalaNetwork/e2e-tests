import { beforeEach, describe, it } from 'vitest'
import { bnToHex } from '@polkadot/util'
import { sendTransaction } from '@acala-network/chopsticks-testing'

import { checkEvents, checkSystemEvents } from '../../helpers'

import { Network, createContext, createNetworks } from '../../networks'

import { query } from '../../helpers/api'

describe.each([
  {
    name: 'karura',
  },
  {
    name: 'acala',
  },
] as const)('$name stable asset', async ({ name }) => {
  let chain: Network

  const ctx = createContext()
  const { alice } = ctx

  beforeEach(async () => {
    const { [name]: chain1 } = await createNetworks({ [name]: undefined }, ctx)
    chain = chain1

    // restore Homa.toBondPool to correct liquid token exchange rate
    const apiAt = await chain.api.at(await chain.api.rpc.chain.getBlockHash(chain.chain.head.number - 1))
    const toBondPool: any = await apiAt.query.homa.toBondPool()
    await chain.dev.setStorage({
      Homa: {
        toBondPool: bnToHex(toBondPool, { bitLength: 128, isLe: true }),
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

    it.each([
      {
        name: 'stableAssetRedeemSingle',
        tx: (x: any) => chain.api.tx.stableAsset.redeemSingle(0, x, 0, 0, 2),
        event: 'RedeemedSingle',
      },
      {
        name: 'redeemProportion',
        tx: (x: any) => chain.api.tx.stableAsset.redeemProportion(0, x, [0, 0]),
        event: 'RedeemedProportion',
      },
    ])('$name', async ({ tx, event }) => {
      const balData: any = await query.tokens({ StableAssetPoolToken: 0 })(chain, alice.address)

      const tx0 = await sendTransaction(tx(balData.free).signAsync(alice))

      await chain.chain.newBlock()

      await checkEvents(tx0, { section: 'stableAsset', method: event }).redact({ number: true }).toMatchSnapshot()
    })
  })
})
