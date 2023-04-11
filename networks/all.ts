import { Config } from './types'

import acala2160Config from './acala2160'
import acalaConfig from './acala'
import hydraDXConfig from './hydraDX'
import moonbeamConfig from './moonbeam'
import polkadot9381Config from './polkadot9381'
import polkadotConfig from './polkadot'
import statemintConfig from './statemint'

const all = {
  polkadot: polkadotConfig,
  polkadot9381: polkadot9381Config,
  statemint: statemintConfig,
  acala: acalaConfig,
  acala2160: acala2160Config,
  moonbeam: moonbeamConfig,
  hydraDX: hydraDXConfig,
} satisfies Record<string, Config>

export default all
