import { beforeEach, describe, it } from 'vitest'
import { sendTransaction } from '@acala-network/chopsticks-testing'

import { Network, createContext, createNetworks } from '../networks'
import { check, checkEvents, checkSystemEvents, checkUmp } from '../helpers'
import { queryTokens, tx, xcm } from '../helpers/api'

const tests = [
  // acala <-> polkadot
  {
    from: 'acala',
    to: 'polkadot',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transferV2({ Token: 'DOT' }, 1e12, xcm.relaychainV2),
        balance: queryTokens({ Token: 'DOT' }),
      },
    },
  },
  {
    from: 'polkadot',
    to: 'acala',
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(xcm.nativeToken, 1e12, xcm.parachainV2(2000)),
        balance: queryTokens({ Token: 'DOT' }),
      },
    },
  },
  // acala <-> polkadot9381
  {
    from: 'acala',
    to: 'polkadot9381',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transferV2({ Token: 'DOT' }, 1e12, xcm.relaychainV2),
        balance: queryTokens({ Token: 'DOT' }),
      },
    },
  },
  {
    from: 'polkadot9381',
    to: 'acala',
    toOptions: undefined,
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(xcm.nativeToken, 1e12, xcm.parachainV3(2000)),
        balance: queryTokens({ Token: 'DOT' }),
      },
    },
  },
  // karura <-> kusama
  {
    from: 'karura',
    to: 'kusama',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transferV2({ Token: 'KSM' }, 1e12, xcm.relaychainV2),
        balance: queryTokens({ Token: 'KSM' }),
      },
    },
  },
  {
    from: 'kusama',
    to: 'karura',
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(xcm.nativeToken, 1e12, xcm.parachainV2(2000)),
        balance: queryTokens({ Token: 'KSM' }),
      },
    },
  },
  // karura <-> kusama9381
  {
    from: 'karura',
    to: 'kusama9381',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transferV2({ Token: 'KSM' }, 1e12, xcm.relaychainV2),
        balance: queryTokens({ Token: 'KSM' }),
      },
    },
  },
  {
    from: 'kusama9381',
    to: 'karura',
    toOptions: undefined,
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(xcm.nativeToken, 1e12, xcm.parachainV3(2000)),
        balance: queryTokens({ Token: 'KSM' }),
      },
    },
  },
] as const

describe.each(tests)('$from -> $to xcm transfer', async ({ from, to, test, ...opt }) => {
  let fromChain: Network
  let toChain: Network
  const ctx = createContext()
  const { alice } = ctx

  beforeEach(async () => {
    const { [from]: parachain1, [to]: relaychain1 } = await createNetworks(
      {
        [from]: undefined,
        [to]: undefined,
      } as any,
      ctx
    )

    fromChain = parachain1
    toChain = relaychain1

    return async () => {
      await toChain.teardown()
      await fromChain.teardown()
    }
  })

  if ('xtokensUp' in test) {
    const { balance, tx } = test.xtokensUp

    it('xtokens transfer', async () => {
      const tx0 = await sendTransaction(tx(fromChain, alice.addressRaw).signAsync(alice))

      await fromChain.chain.newBlock()

      await check(balance(fromChain, alice.address)).redact().toMatchSnapshot('balance on from chain')
      await checkEvents(tx0, 'xTokens').toMatchSnapshot('tx events')
      await checkUmp(fromChain).toMatchSnapshot('from chain ump messages')

      await toChain.chain.newBlock()

      await check(toChain.api.query.system.account(alice.address)).redact().toMatchSnapshot('balance on to chain')
      await checkSystemEvents(toChain, 'ump').toMatchSnapshot('to chain ump events')
    })
  }

  if ('xcmPalletDown' in test) {
    const { balance, tx } = test.xcmPalletDown

    it('xcmPallet transfer', async () => {
      const tx0 = await sendTransaction(tx(fromChain, alice.addressRaw).signAsync(alice))

      await fromChain.chain.newBlock()

      await check(fromChain.api.query.system.account(alice.address)).redact().toMatchSnapshot('balance on from chain')
      await checkEvents(tx0, 'xcmPallet').toMatchSnapshot('tx events')

      await toChain.chain.newBlock()

      await check(balance(toChain, alice.address)).redact().toMatchSnapshot('balance on to chain')
      await checkSystemEvents(toChain, 'parachainSystem', 'dmpQueue').toMatchSnapshot('to chain dmp events')
    })
  }
})
