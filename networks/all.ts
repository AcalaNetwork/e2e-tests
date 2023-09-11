import { Config } from './types'

import acala2200Config from './acala2200'
import acalaConfig from './acala'
import acalaNextConfig from './acala-next'
import astarConfig from './astar'
import bifrostConfig from './bifrost'
import centrifugeConfig from './centrifuge'
import crustConfig from './crust'
import hydraDXConfig from './hydraDX'
import interlayConfig from './interlay'
import moonbeamConfig from './moonbeam'
import parallelConfig from './parallel'
import polkadotConfig from './polkadot'
import statemintConfig from './statemint'
import uniqueConfig from './unique'

const all = {
  polkadot: polkadotConfig,
  statemint: statemintConfig,
  acala: acalaConfig,
  astar: astarConfig,
  acala2200: acala2200Config,
  acalaNext: acalaNextConfig,
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
