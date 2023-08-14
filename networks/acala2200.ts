import { Config } from './types'

import acalaConfig, { Vars } from './acala'

export default {
  ...acalaConfig,
  polkadot: {
    ...acalaConfig.polkadot,
    name: 'acala2200' as const,
  },
  kusama: {
    ...acalaConfig.kusama,
    name: 'karura2200' as const,
  },
  config: (opt) => ({
    ...acalaConfig.config(opt),
    options: {
      wasmOverride: {
        polkadot: './wasm/acala-2200.wasm',
        kusama: './wasm/karura-2200.wasm',
      }[opt.network],
    },
  }),
} satisfies Config<Vars>
