import { Config } from './types'

import astarConfig, { Vars } from './astar'

export default {
  ...astarConfig,
  polkadot: {
    ...astarConfig.polkadot,
    name: 'astar55' as const,
  },
  kusama: {
    ...astarConfig.kusama,
    name: 'shiden93' as const,
  },
  config: (opt) => ({
    ...astarConfig.config(opt),
    options: {
      wasmOverride: {
        polkadot: './wasm/astar-55.wasm',
        kusama: './wasm/shiden-93.wasm',
      }[opt.network],
    },
  }),
} satisfies Config<Vars>
