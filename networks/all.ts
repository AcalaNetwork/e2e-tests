import { Config } from './types'

import acalaConfig from './acala'
import acalaNextConfig from './acala-next'
import assetHubConfig from './assetHub'
import astarConfig from './astar'
import bifrostConfig from './bifrost'
import centrifugeConfig from './centrifuge'
import crustConfig from './crust'
import darwiniaConfig from './darwinia'
import hydraDXConfig from './hydraDX'
import interlayConfig from './interlay'
import moonbeamConfig from './moonbeam'
// import parallelConfig from './parallel'
import phalaConfig from './phala'
import polkadotConfig from './polkadot'
import uniqueConfig from './unique'

const all = {
  polkadot: polkadotConfig,
  acala: acalaConfig,
  astar: astarConfig,
  assetHub: assetHubConfig,
  acalaNext: acalaNextConfig,
  moonbeam: moonbeamConfig,
  hydraDX: hydraDXConfig,
  bifrost: bifrostConfig,
  centrifuge: centrifugeConfig,
  // parallel: parallelConfig,
  crust: crustConfig,
  unique: uniqueConfig,
  interlay: interlayConfig,
  phala: phalaConfig,
  darwinia: darwiniaConfig,
} satisfies Record<string, Config>

export default all
