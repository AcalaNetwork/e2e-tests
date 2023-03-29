import { SetupOption, setupContext } from '@acala-network/chopsticks-testing'
import { connectParachains, connectVertical } from '@acala-network/chopsticks'
import dotenv from 'dotenv'

import { Config, Context, NetworkKind } from './types'

import { testingPairs } from '../helpers'
import acala2160Config from './acala2160'
import acalaConfig from './acala'
import hydraDXConfig from './hydraDX'
import moonbeamConfig from './moonbeam'
import polkadot9381Config from './polkadot9381'
import polkadotConfig from './polkadot'
import statemintConfig from './statemint'

dotenv.config()

const networkDefs = {
  polkadot: polkadotConfig,
  polkadot9381: polkadot9381Config,
  statemint: statemintConfig,
  acala: acalaConfig,
  acala2160: acala2160Config,
  moonbeam: moonbeamConfig,
  hydraDX: hydraDXConfig,
} satisfies Record<string, Config>

const toNumber = (value: string | undefined): number | undefined => {
  if (value === undefined) {
    return undefined
  }

  return Number(value)
}

export type Network = Awaited<ReturnType<typeof setupContext>> & {
  options: SetupOption
  config: (typeof networkDefs)[keyof typeof networkDefs][NetworkKind]
}
export type NetworkNames = (typeof networkDefs)[keyof typeof networkDefs][NetworkKind]['name']

export const networkCreator = {} as Record<
  NetworkNames,
  (options?: Partial<SetupOption>) => (ctx: Context) => Promise<Network>
>

const relaychains = ['polkadot', 'kusama'] as const

for (const def of Object.values(networkDefs)) {
  for (const relaychain of relaychains) {
    const config = def[relaychain]
    const { endpoint, name } = config
    const upperName = name.toUpperCase()
    networkCreator[name] = (options?: Partial<SetupOption>) => async (ctx: Context) => {
      const setupConfig = (def as Config).config({
        network: relaychain,
        ...config,
        ...ctx,
      })

      const finalOptions: SetupOption = {
        timeout: 180000,
        wasmOverride: process.env[`${upperName}_WASM`],
        blockNumber: toNumber(process.env[`${upperName}_BLOCK_NUMBER`]),
        endpoint: process.env[`${upperName}_ENDPOINT`] ?? endpoint,
        db: process.env.DB_PATH,
        ...setupConfig.options,
        ...options,
      }

      const network = await setupContext(finalOptions)

      await network.dev.setStorage(setupConfig.storages)

      return {
        ...network,
        config,
        options: finalOptions,
      }
    }
  }
}

export const createContext = () => testingPairs()

export const createNetworks = async (
  networkOptions: Record<NetworkNames, Partial<SetupOption> | undefined>,
  context = createContext()
) => {
  const ret = {} as Record<NetworkNames, Network>

  let wasmOverriden = false

  for (const [name, options] of Object.entries(networkOptions) as [NetworkNames, Partial<SetupOption> | undefined][]) {
    ret[name] = await networkCreator[name](options)(context)
    wasmOverriden ||= !!ret[name].options.wasmOverride
  }

  const relaychainName = Object.keys(ret).filter(
    (x) => x.startsWith('polkadot') || x.startsWith('kusama')
  )[0] as NetworkKind
  const { [relaychainName]: relaychain, ...parachains } = ret

  if (relaychain) {
    for (const parachain of Object.values(parachains)) {
      await connectVertical(relaychain.chain, parachain.chain)
    }
  }

  const parachainList = Object.values(parachains).map((i) => i.chain)
  if (parachainList.length > 0) {
    await connectParachains(parachainList)
  }

  if (wasmOverriden) {
    // trigger runtime upgrade if needed (due to wasm override)
    for (const chain of Object.values(ret)) {
      await chain.dev.newBlock()
    }
    // handle xcm version message if needed (due to wasm override triggered xcm version upgrade)
    for (const chain of Object.values(ret)) {
      await chain.dev.newBlock()
    }
  }

  return ret
}

// to be compatible with old code

const networks = {} as Record<NetworkNames, (options?: Partial<SetupOption>) => Promise<Network>>

for (const [name, creator] of Object.entries(networkCreator)) {
  networks[name as NetworkNames] = async (options?: Partial<SetupOption>) => creator(options)(createContext())
}

export default networks
