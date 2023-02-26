import { SetupOption, setupContext } from './helper'

const endpoints = {
  polkadot: 'wss://rpc.polkadot.io',
  statemint: 'wss://statemint-rpc.polkadot.io',
  acala: 'wss://acala-rpc-0.aca-api.network',
  kusama: 'wss://kusama-rpc.polkadot.io',
  statemine: 'wss://statemine-rpc.polkadot.io',
  karura: 'wss://karura-rpc-0.aca-api.network'
}

export default {
  polkadot: (options?: Partial<SetupOption>) => setupContext({ endpoint: endpoints.polkadot, ...options }),
  statemint: (options?: Partial<SetupOption>) => setupContext({ endpoint: endpoints.statemint, ...options }),
  acala: (options?: Partial<SetupOption>) => setupContext({ endpoint: endpoints.acala, ...options }),
  kusama: (options?: Partial<SetupOption>) => setupContext({ endpoint: endpoints.kusama, ...options }),
  statemine: (options?: Partial<SetupOption>) => setupContext({ endpoint: endpoints.statemine, ...options }),
  karura: (options?: Partial<SetupOption>) => setupContext({ endpoint: endpoints.karura, ...options }),
}
