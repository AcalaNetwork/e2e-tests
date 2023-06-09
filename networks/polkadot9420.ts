import { Config } from './types'

import polkadotConfig from './polkadot'

export default {
  ...polkadotConfig,
  polkadot: {
    // eslint-disable-next-line import/no-named-as-default-member
    ...polkadotConfig.polkadot,
    name: 'polkadot9420' as const,
  },
  kusama: {
    // eslint-disable-next-line import/no-named-as-default-member
    ...polkadotConfig.kusama,
    name: 'kusama9420' as const,
  },
  config: (opt) => ({
    ...polkadotConfig.config(opt),
    options: {
      wasmOverride: {
        polkadot: process.env['POLKADOT9420_WASM'] || './wasm/polkadot_runtime-v9420.compact.compressed.wasm',
        kusama: process.env['KUSAMA9420_WASM'] || './wasm/kusama_runtime-v9420.compact.compressed.wasm',
      }[opt.network],
    },
  }),
} satisfies Config
