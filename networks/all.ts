import { Config } from './types'

import acala2160Config from './acala2160'
import acalaConfig from './acala'
import astarConfig from './astar'
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
  acala2160: acala2160Config,
  moonbeam: moonbeamConfig,
  hydraDX: hydraDXConfig,
} satisfies Record<string, Config>

export default all
