import { Config } from './types'

import acalaConfig, { Vars } from './acala'

export default {
  ...acalaConfig,
  polkadot: {
    ...acalaConfig.polkadot,
    name: 'acala2160' as const,
  },
  kusama: {
    ...acalaConfig.kusama,
    name: 'karura2160' as const,
  },
  config: (opt) => ({
    ...acalaConfig.config(opt),
    options: {
      wasmOverride: {
        polkadot: './wasm/acala-2160-dev.wasm',
        kusama: './wasm/karura-2160-dev.wasm',
      }[opt.network],
    },
  }),
} satisfies Config<Vars>
