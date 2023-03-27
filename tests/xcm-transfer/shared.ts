import { beforeEach, describe, it } from 'vitest'
import { sendTransaction } from '@acala-network/chopsticks-testing'

import { Network, createContext, createNetworks } from '../../networks'
import { check, checkEvents, checkHrmp, checkSystemEvents, checkUmp } from '../../helpers'

import type { TestType as KusamaTestType } from './kusama.test'
import type { TestType as PolkadotTestType } from './polkadot.test'

export default function buildTest(tests: ReadonlyArray<PolkadotTestType | KusamaTestType>) {
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
}
