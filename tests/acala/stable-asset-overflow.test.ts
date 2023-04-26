import { beforeEach, describe, it } from 'vitest'
import { bnToHex } from '@polkadot/util'
import { sendTransaction } from '@acala-network/chopsticks-testing'

import { checkEvents } from '../../helpers'

import { Network, createContext, createNetworks } from '../../networks'

describe.each([
  {
    name: 'karura',
    block: 4180050,
    wasm: './wasm/karura-2170.wasm',
  },
  {
    name: 'acala',
    block: 3419758,
    wasm: './wasm/acala-2170.wasm',
  },
] as const)('$name stable asset overflow', async ({ name, block, wasm }) => {
  let chain: Network

  const ctx = createContext()
  const { alice } = ctx

  beforeEach(async () => {
    const { [name]: chain1 } = await createNetworks(
      {
        [name]: {
          blockNumber: block,
          wasmOverride: wasm,
        },
      },
      ctx
    )
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
