import { Config } from './types'

import acalaConfig from './acala'
import acalaNextConfig from './acala-next'
import assethubConfig from './assethub'
import astarConfig from './astar'
import bifrostConfig from './bifrost'
import hydraDXConfig from './hydraDX'
import interlayConfig from './interlay'
import moonbeamConfig from './moonbeam'
import polkadotConfig from './polkadot'

const all = {
  polkadot: polkadotConfig,
  assethub: assethubConfig,
  acala: acalaConfig,
  astar: astarConfig,
  acalaNext: acalaNextConfig,
  moonbeam: moonbeamConfig,
  hydraDX: hydraDXConfig,
  bifrost: bifrostConfig,
  interlay: interlayConfig,
} satisfies Record<string, Config>

export default all
