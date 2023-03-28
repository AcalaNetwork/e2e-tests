import { beforeEach, describe, it } from 'vitest'
import { sendTransaction } from '@acala-network/chopsticks-testing'

import { Network, NetworkNames, createContext, createNetworks } from '../../networks'
import { check, checkEvents, checkHrmp, checkSystemEvents, checkUmp } from '../../helpers'

import type { TestType as KusamaParaTestType } from './kusama-para.test'
import type { TestType as KusamaRelayTestType } from './kusama-relay.test'
import type { TestType as PolkadotParaTestType } from './polkadot-para.test'
import type { TestType as PolkadotRelayTestType } from './polkadot-relay.test'

type TestType = KusamaRelayTestType | KusamaParaTestType | PolkadotRelayTestType | PolkadotParaTestType

export default function buildTest(tests: ReadonlyArray<TestType>) {
  describe.each(tests)('$from -> $to xcm transfer $name', async ({ from, to, test, ...opt }) => {
    let fromChain: Network
    let toChain: Network
    let reserveChain: Network

    const ctx = createContext()
    const { alice } = ctx

    beforeEach(async () => {
      const networkOptions = {
        [from]: undefined,
        [to]: undefined,
      } as Record<NetworkNames, undefined>
      if ('reserve' in opt) {
        networkOptions[opt.reserve] = undefined
      }
      const chains = await createNetworks(networkOptions, ctx)

      fromChain = chains[from]
      toChain = chains[to]
      if ('reserve' in opt) {
        reserveChain = chains[opt.reserve]
      }

      if ('fromStorage' in opt) {
        const override = typeof opt.fromStorage === 'function' ? opt.fromStorage(ctx) : opt.fromStorage
        await fromChain.dev.setStorage(override)
      }

      return async () => {
        await toChain.teardown()
        await fromChain.teardown()
        if (reserveChain) {
          await reserveChain.teardown()
        }
      }
    })

    if ('xtokensUp' in test) {
      const { balance, tx } = test.xtokensUp

      it('xtokens transfer', async () => {
        const tx0 = await sendTransaction(tx(fromChain, alice.addressRaw).signAsync(alice))

        await fromChain.chain.newBlock()

        await check(balance(fromChain, alice.address)).redact({ number: 4 }).toMatchSnapshot('balance on from chain')
        await checkEvents(tx0, 'xTokens').toMatchSnapshot('tx events')
        await checkUmp(fromChain).toMatchSnapshot('from chain ump messages')

        await toChain.chain.newBlock()

        await check(toChain.api.query.system.account(alice.address))
          .redact({ number: 4 })
          .toMatchSnapshot('balance on to chain')
        await checkSystemEvents(toChain, 'ump').toMatchSnapshot('to chain ump events')
      })
    }

    if ('xcmPalletDown' in test) {
      const { balance, tx } = test.xcmPalletDown

      it('xcmPallet transfer', async () => {
        const tx0 = await sendTransaction(tx(fromChain, alice.addressRaw).signAsync(alice))

        await fromChain.chain.newBlock()

        await check(fromChain.api.query.system.account(alice.address))
          .redact({ number: 4 })
          .toMatchSnapshot('balance on from chain')
        await checkEvents(tx0, 'xcmPallet').toMatchSnapshot('tx events')

        await toChain.chain.newBlock()

        await check(balance(toChain, alice.address)).redact({ number: 4 }).toMatchSnapshot('balance on to chain')
        await checkSystemEvents(toChain, 'parachainSystem', 'dmpQueue').toMatchSnapshot('to chain dmp events')
      })
    }

    if ('xcmPalletHorzontal' in test) {
      const { fromBalance, toBalance, tx, ...testOpt } = test.xcmPalletHorzontal

      it('xcmPallet transfer', async () => {
        const tx0 = await sendTransaction(tx(fromChain, alice.addressRaw).signAsync(alice))

        await fromChain.chain.newBlock()

        await check(fromBalance(fromChain, alice.address))
          .redact({ number: 4 })
          .toMatchSnapshot('balance on from chain')
        await checkEvents(tx0, 'polkadotXcm').toMatchSnapshot('tx events')

        if ('checkUmp' in testOpt) {
          await checkUmp(fromChain).toMatchSnapshot('from chain ump messages')
        } else {
          await checkHrmp(fromChain).toMatchSnapshot('from chain hrmp messages')
        }

        if (reserveChain) {
          await reserveChain.chain.newBlock()
        }
        await toChain.chain.newBlock()

        await check(toBalance(toChain, alice.address)).redact({ number: 4 }).toMatchSnapshot('balance on to chain')
        await checkSystemEvents(toChain, 'xcmpQueue', 'dmpQueue').toMatchSnapshot('to chain xcm events')
      })
    }

    if ('xtokenstHorzontal' in test) {
      const { fromBalance, toBalance, tx, ...testOpt } = test.xtokenstHorzontal

      it('xtokens transfer', async () => {
        const tx0 = await sendTransaction(tx(fromChain, alice.addressRaw).signAsync(alice))

        await fromChain.chain.newBlock()

        await check(fromBalance(fromChain, alice.address))
          .redact({ number: 4 })
          .toMatchSnapshot('balance on from chain')
        await checkEvents(tx0, 'xTokens').toMatchSnapshot('tx events')

        if ('checkUmp' in testOpt) {
          await checkUmp(fromChain).toMatchSnapshot('from chain ump messages')
        } else {
          await checkHrmp(fromChain).toMatchSnapshot('from chain hrmp messages')
        }

        if (reserveChain) {
          await reserveChain.chain.newBlock()
        }
        await toChain.chain.newBlock()

        await check(toBalance(toChain, alice.address)).redact({ number: 4 }).toMatchSnapshot('balance on to chain')
        await checkSystemEvents(toChain, 'xcmpQueue', 'dmpQueue').toMatchSnapshot('to chain xcm events')
      })
    }
  })
}
