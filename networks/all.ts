import { Config } from './types'

import acala2180Config from './acala2180'
import acalaConfig from './acala'
import astarConfig from './astar'
import bifrostConfig from './bifrost'
import centrifugeConfig from './centrifuge'
import hydraDXConfig from './hydraDX'
import moonbeamConfig from './moonbeam'
import polkadot9420Config from './polkadot9420'
import polkadotConfig from './polkadot'
import statemintConfig from './statemint'

const all = {
  polkadot: polkadotConfig,
  polkadot9420: polkadot9420Config,
  statemint: statemintConfig,
  acala: acalaConfig,
  astar: astarConfig,
  acala2180: acala2180Config,
  moonbeam: moonbeamConfig,
  hydraDX: hydraDXConfig,
  bifrost: bifrostConfig,
  centrifuge: centrifugeConfig,
} satisfies Record<string, Config>

export default all
