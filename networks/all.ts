import { Config } from './types'

import acala2180Config from './acala2180'
import acalaConfig from './acala'
import astarConfig from './astar'
import bifrostConfig from './bifrost'
import centrifugeConfig from './centrifuge'
import crustConfig from './crust'
import hydraDXConfig from './hydraDX'
import interlayConfig from './interlay'
import moonbeamConfig from './moonbeam'
import parallelConfig from './parallel'
import polkadot9420Config from './polkadot9420'
import polkadotConfig from './polkadot'
import statemintConfig from './statemint'
import uniqueConfig from './unique'

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
  parallel: parallelConfig,
  crust: crustConfig,
  unique: uniqueConfig,
  interlay: interlayConfig,
} satisfies Record<string, Config>

export default all
