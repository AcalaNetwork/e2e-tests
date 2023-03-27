import { Config } from './types'

export default {
  polkadot: {
    name: 'polkadot9381' as const,
    endpoint: 'wss://rpc.polkadot.io',
  },
  kusama: {
    name: 'kusama9381' as const,
    endpoint: 'wss://kusama-rpc.polkadot.io',
  },
  config: ({ network, alice }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
      ParasDisputes: {
        // those can makes block building super slow
        $removePrefix: ['disputes'],
      },
    },
    options: {
      wasmOverride: {
        polkadot: './wasm/polkadot_runtime-v9381.compact.compressed.wasm',
        kusama: './wasm/kusama_runtime-v9381.compact.compressed.wasm',
      }[network]
    }
  }),
} satisfies Config
