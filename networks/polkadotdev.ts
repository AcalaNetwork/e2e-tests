import { Config } from './types'

import polkadotConfig from './polkadot'

export default {
  ...polkadotConfig,
  polkadot: {
    // eslint-disable-next-line import/no-named-as-default-member
    ...polkadotConfig.polkadot,
    name: 'polkadotdev' as const,
  },
  kusama: {
    // eslint-disable-next-line import/no-named-as-default-member
    ...polkadotConfig.kusama,
    name: 'kusamadev' as const,
  },
  config: (opt) => ({
    ...polkadotConfig.config(opt),
    options: {
      wasmOverride: {
        polkadot: './wasm/polkadot_runtime.compact.compressed.wasm',
        kusama: './wasm/kusama_runtime-v9420.compact.compressed.wasm',
      }[opt.network],
    },
  }),
} satisfies Config
