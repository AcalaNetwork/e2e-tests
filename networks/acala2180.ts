import { Config } from './types'

import acalaConfig, { Vars } from './acala'

export default {
  ...acalaConfig,
  polkadot: {
    ...acalaConfig.polkadot,
    name: 'acala2180' as const,
  },
  kusama: {
    ...acalaConfig.kusama,
    name: 'karura2180' as const,
  },
  config: (opt) => ({
    ...acalaConfig.config(opt),
    options: {
      wasmOverride: {
        polkadot: './wasm/acala-2180.wasm',
        kusama: './wasm/karura-2180.wasm',
      }[opt.network],
    },
  }),
} satisfies Config<Vars>
