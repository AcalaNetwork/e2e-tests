import { Config } from './types'

import acala2180Config from './acala2180'
import acalaConfig from './acala'
import astarConfig from './astar'
import hydraDXConfig from './hydraDX'
import moonbeamConfig from './moonbeam'
import polkadot9420Config from './polkadot9420'
import polkadotConfig from './polkadot'
import polkadotdevConfig from './polkadotdev'
import statemintConfig from './statemint'

const all = {
  polkadot: polkadotConfig,
  polkadot9420: polkadot9420Config,
  polkadotdev: polkadotdevConfig,
  statemint: statemintConfig,
  acala: acalaConfig,
  astar: astarConfig,
  acala2180: acala2180Config,
  moonbeam: moonbeamConfig,
  hydraDX: hydraDXConfig,
} satisfies Record<string, Config>

export default all
