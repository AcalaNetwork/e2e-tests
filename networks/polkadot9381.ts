import { Config } from './types'

import polkadotConfig from './polkadot'

export default {
  ...polkadotConfig,
  polkadot: {
    // eslint-disable-next-line import/no-named-as-default-member
    ...polkadotConfig.polkadot,
    name: 'polkadot9381' as const,
  },
  kusama: {
    // eslint-disable-next-line import/no-named-as-default-member
    ...polkadotConfig.kusama,
    name: 'kusama9381' as const,
  },
  config: (opt) => ({
    ...polkadotConfig.config(opt),
    options: {
      wasmOverride: {
        polkadot: './wasm/polkadot_runtime-v9381.compact.compressed.wasm',
        kusama: './wasm/kusama_runtime-v9381.compact.compressed.wasm',
      }[opt.network],
    },
  }),
} satisfies Config
