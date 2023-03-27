import { beforeEach, describe, it } from 'vitest'
import { sendTransaction } from '@acala-network/chopsticks-testing'

import { Network, createContext, createNetworks } from '../networks'
import { check, checkEvents, checkHrmp, checkSystemEvents, checkUmp } from '../helpers'
import { query, tx } from '../helpers/api'

import { acala, karura } from '../networks/acala'
import { kusama, polkadot } from '../networks/polkadot'
import { statemine, statemint } from '../networks/statemint'

const tests = [
  // acala <-> polkadot
  {
    from: 'acala',
    to: 'polkadot',
    name: 'dot',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transferV2(acala.dot, 1e12, tx.xtokens.relaychainV2),
        balance: query.tokens(acala.dot),
      },
    },
  },
  {
    from: 'polkadot',
    to: 'acala',
    name: 'dot',
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(polkadot.dot, 1e12, tx.xcmPallet.parachainV2(0, 2000)),
        balance: query.tokens(acala.dot),
      },
    },
  },
  // acala <-> polkadot9381
  {
    from: 'acala',
    to: 'polkadot9381',
    name: 'dot',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transferV2(acala.dot, 1e12, tx.xtokens.relaychainV2),
        balance: query.tokens(acala.dot),
      },
    },
  },
  {
    from: 'polkadot9381',
    to: 'acala',
    name: 'dot',
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(polkadot.dot, 1e12, tx.xcmPallet.parachainV3(2000)),
        balance: query.tokens(acala.dot),
      },
    },
  },
  // karura <-> kusama
  {
    from: 'karura',
    to: 'kusama',
    name: 'ksm',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transferV2(karura.ksm, 1e12, tx.xtokens.relaychainV2),
        balance: query.tokens(karura.ksm),
      },
    },
  },
  {
    from: 'kusama',
    to: 'karura',
    name: 'ksm',
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(kusama.ksm, 1e12, tx.xcmPallet.parachainV2(0, 2000)),
        balance: query.tokens(karura.ksm),
      },
    },
  },
  // karura <-> kusama9381
  {
    from: 'karura',
    to: 'kusama9381',
    name: 'ksm',
    test: {
      xtokensUp: {
        tx: tx.xtokens.transferV2(karura.ksm, 1e12, tx.xtokens.relaychainV2),
        balance: query.tokens(karura.ksm),
      },
    },
  },
  {
    from: 'kusama9381',
    to: 'karura',
    name: 'ksm',
    test: {
      xcmPalletDown: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV3(kusama.ksm, 1e12, tx.xcmPallet.parachainV3(2000)),
        balance: query.tokens(karura.ksm),
      },
    },
  },
  // statemint <-> acala
  {
    from: 'statemint',
    to: 'acala',
    name: 'WBTC',
    test: {
      xcmPalletHorzontal: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(statemint.wbtc, 1e6, tx.xcmPallet.parachainV2(1, 2000)),
        fromBalance: query.assets(statemint.wbtcIndex),
        toBalance: query.tokens(acala.wbtc),
      },
    },
  },
  {
    from: 'acala',
    to: 'statemint',
    name: 'WBTC',
    test: {
      xtokenstHorzontal: {
        tx: tx.xtokens.transferV2(acala.wbtc, 1e6, tx.xtokens.parachainV2(1000)),
        fromBalance: query.tokens(acala.wbtc),
        toBalance: query.assets(statemint.wbtcIndex),
      },
    },
  },
  // statemine <-> karura
  {
    from: 'statemine',
    to: 'karura',
    name: 'USDT',
    test: {
      xcmPalletHorzontal: {
        tx: tx.xcmPallet.limitedReserveTransferAssetsV2(statemine.usdt, 1e6, tx.xcmPallet.parachainV2(1, 2000)),
        fromBalance: query.assets(statemine.usdtIndex),
        toBalance: query.tokens(karura.usdt),
      },
    },
  },
  {
    from: 'karura',
    to: 'statemine',
    name: 'USDT',
    test: {
      xtokenstHorzontal: {
        tx: tx.xtokens.transferV2(karura.usdt, 1e6, tx.xtokens.parachainV2(1000)),
        fromBalance: query.tokens(karura.usdt),
        toBalance: query.assets(statemine.usdtIndex),
      },
    },
  },
] as const

describe.each(tests)('$from -> $to xcm transfer $name', async ({ from, to, test }) => {
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

  if ('xcmPalletHorzontal' in test) {
    const { fromBalance, toBalance, tx } = test.xcmPalletHorzontal

    it('xcmPallet transfer', async () => {
      const tx0 = await sendTransaction(tx(fromChain, alice.addressRaw).signAsync(alice))

      await fromChain.chain.newBlock()

      await check(fromBalance(fromChain, alice.address)).redact().toMatchSnapshot('balance on from chain')
      await checkEvents(tx0, 'xcmPallet').toMatchSnapshot('tx events')
      await checkHrmp(fromChain).toMatchSnapshot('from chain ump messages')

      await toChain.chain.newBlock()

      await check(toBalance(toChain, alice.address)).redact().toMatchSnapshot('balance on to chain')
      await checkSystemEvents(toChain, 'xcmpQueue').toMatchSnapshot('to chain dmp events')
    })
  }

  if ('xtokenstHorzontal' in test) {
    const { fromBalance, toBalance, tx } = test.xtokenstHorzontal

    it('xtokens transfer', async () => {
      const tx0 = await sendTransaction(tx(fromChain, alice.addressRaw).signAsync(alice))

      await fromChain.chain.newBlock()

      await check(fromBalance(fromChain, alice.address)).redact().toMatchSnapshot('balance on from chain')
      await checkEvents(tx0, 'xTokens').toMatchSnapshot('tx events')
      await checkHrmp(fromChain).toMatchSnapshot('from chain ump messages')

      await toChain.chain.newBlock()

      await check(toBalance(toChain, alice.address)).redact().toMatchSnapshot('balance on to chain')
      await checkSystemEvents(toChain, 'xcmpQueue').toMatchSnapshot('to chain ump events')
    })
  }
})
