import { beforeEach } from 'vitest'
import { connectParachains, connectVertical } from '@acala-network/chopsticks'
import { testingPairs } from '@acala-network/chopsticks-testing'
import dotenv from 'dotenv'

import { Context, NetworkKind } from './types'
import { SetupOption, setupContext } from '../helper'

import acala from './acala'
import hydraDX from './hydraDX'
import polkadot from './polkadot'
import statemint from './statemint'

dotenv.config()

const networkDefs = {
  acala,
  hydraDX,
  polkadot,
  statemint,
}

const toNumber = (value: string | undefined): number | undefined => {
  if (value === undefined) {
    return undefined
  }

  return Number(value)
}

export type Network = Awaited<ReturnType<typeof setupContext>>
export type NetworkNames = (typeof networkDefs)[keyof typeof networkDefs][NetworkKind]['name']

export const networkCreator = {} as Record<NetworkNames, (options?: Partial<SetupOption>) => (ctx: Context) => Promise<Network>>

const relaychains = ['polkadot', 'kusama'] as const

for (const def of Object.values(networkDefs)) {
  for (const relaychain of relaychains) {
    const config = def[relaychain]
    const { endpoint, name } = config
    const upperName = name.toUpperCase()
    networkCreator[name] = (options?: Partial<SetupOption>) => async (ctx: Context) => {
      const network = await setupContext({
        wasmOverride: process.env[`${upperName}_WASM`],
        blockNumber: toNumber(process.env[`${upperName}_BLOCK_NUMBER`]),
        endpoint: process.env[`${upperName}_ENDPOINT`] ?? endpoint,
        db: process.env.DB_PATH,
        ...options,
      })

      const setupConfig = def.config({
        network: relaychain,
        ...config,
        ...ctx,
      } as any)

      await network.dev.setStorage(setupConfig.storages)

      return {
        ...network,
        config,
      }
    }
  }
}

export const createContext = () => testingPairs()

export const createNetworks = async (networkOptions: Record<NetworkNames, Partial<SetupOption> | undefined>, context = createContext()) => {
  const ret = {} as Record<NetworkNames, Network>

  for (const [name, options] of Object.entries(networkOptions) as [NetworkNames, Partial<SetupOption> | undefined][]) {
    ret[name] = await networkCreator[name](options)(context)
  }

  const { polkadot, kusama, ...parachains} = ret
  const relaychain = polkadot || kusama

  if (relaychain) {
    for (const parachain of Object.values(parachains)) {
      await connectVertical(relaychain.chain, parachain.chain)
    }
  }

  const parachainList = Object.values(parachains).map((i) => i.chain)
  if (parachainList.length > 0) {
    await connectParachains(parachainList)
  }

  // // trigger runtime upgrade if needed (due to wasm override)
  // for (const chain of Object.values(ret)) {
  //   await chain.dev.newBlock()
  // }
  // // handle xcm version message if needed (due to wasm override triggered xcm version upgrade)
  // for (const chain of Object.values(ret)) {
  //   await chain.dev.newBlock()
  // }

  return ret
}

// to be compatible with old code

const networks = {} as Record<NetworkNames, (options?: Partial<SetupOption>) => Promise<Network>>

for (const [name, creator] of Object.entries(networkCreator)) {
  networks[name as NetworkNames] = async (options?: Partial<SetupOption>) => creator(options)(createContext())
}

export default networks
