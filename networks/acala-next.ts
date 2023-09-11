import { Config } from './types'

import acalaConfig, { Vars } from './acala'

export default {
  ...acalaConfig,
  polkadot: {
    ...acalaConfig.polkadot,
    name: 'acalaNext' as const,
  },
  kusama: {
    ...acalaConfig.kusama,
    name: 'karuraNext' as const,
  },
  config: (opt) => ({
    ...acalaConfig.config(opt),
    options: {
      wasmOverride: {
        polkadot: './wasm/acala_runtime.wasm',
        kusama: './wasm/karura_runtime.wasm',
      }[opt.network],
    },
  }),
} satisfies Config<Vars>
