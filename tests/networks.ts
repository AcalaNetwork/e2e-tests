import dotenv from 'dotenv'

import { SetupOption, setupContext } from './helper'

dotenv.config()

const endpoints = {
  polkadot: 'wss://rpc.polkadot.io',
  statemint: 'wss://statemint-rpc.polkadot.io',
  acala: 'wss://acala-rpc-0.aca-api.network',
  kusama: 'wss://kusama-rpc.polkadot.io',
  statemine: 'wss://statemine-rpc.polkadot.io',
  karura: 'wss://karura-rpc-0.aca-api.network',
  basilisk: 'wss://basilisk-rpc.dwellir.com',
}

const toNumber = (value: string | undefined): number | undefined => {
  if (value === undefined) {
    return undefined
  }

  return Number(value)
}

export type Network = Awaited<ReturnType<typeof setupContext>>

const networks = {} as Record<keyof typeof endpoints, (options?: Partial<SetupOption>) => Promise<Network>>

for (const [name, endpoint] of Object.entries(endpoints)) {
  const upperName = name.toUpperCase()
  networks[name as keyof typeof endpoints] = (options?: Partial<SetupOption>) =>
    setupContext({
      wasmOverride: process.env[`${upperName}_WASM`],
      blockNumber: toNumber(process.env[`${upperName}_BLOCK_NUMBER`]),
      endpoint: process.env[`${upperName}_ENDPOINT`] ?? endpoint,
      db: process.env.DB_PATH,
      ...options,
    })
}

export default networks
