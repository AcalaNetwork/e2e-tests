import { buildTests } from './shared'

const tests = [
  {
    from: 'karura',
    to: 'kusama',
    token: 'KSM',
  },
  {
    from: 'kusama',
    to: 'karura',
    token: 'KSM',
  },
  {
    from: 'kusama',
    to: 'basilisk',
    token: 'KSM',
    ignoreFee: true,
  },
  // {
  //   from: 'basilisk',
  //   to: 'kusama',
  //   token: 'KSM',
  // },
  {
    from: 'assetHubKusama',
    to: 'kusama',
    token: 'KSM',
  },
  {
    from: 'kusama',
    to: 'assetHubKusama',
    token: 'KSM',
  },
  {
    from: 'assetHubKusama',
    to: 'karura',
    token: 'USDT',
  },
  {
    from: 'karura',
    to: 'assetHubKusama',
    token: 'USDT',
    ignoreFee: true,
  },
  // {
  //   from: 'basilisk',
  //   to: 'karura',
  //   token: 'BSX',
  // },
  // {
  //   from: 'karura',
  //   to: 'basilisk',
  //   token: 'BSX',
  // },
  // {
  //   from: 'karura',
  //   to: 'moonriver',
  //   token: 'KAR',
  // },
  {
    from: 'karura',
    to: 'bifrost',
    token: 'KUSD',
    precision: 2,
  },
  {
    from: 'bifrost',
    to: 'karura',
    token: 'BNC',
  },
  // {
  //   from: 'altair',
  //   to: 'karura',
  //   token: 'AIR',
  // },
  // {
  //   from: 'karura',
  //   to: 'altair',
  //   token: 'AIR',
  // },
  {
    from: 'shiden',
    to: 'karura',
    token: 'KUSD',
  },
  {
    from: 'karura',
    to: 'shiden',
    token: 'KUSD',
  },
  {
    from: 'karura',
    to: 'kintsugi',
    token: 'KINT',
  },
  {
    from: 'kintsugi',
    to: 'karura',
    token: 'KINT',
  },
  {
    from: 'karura',
    to: 'kintsugi',
    token: 'LKSM',
  },
  {
    from: 'kintsugi',
    to: 'karura',
    token: 'LKSM',
  },
  // // btc
  // // {
  // //   from: 'karura',
  // //   to: 'kintsugi',
  // //   token: 'KBTC',
  // //   fee: 0.07407407407400002
  // // },
  // // {
  // //   from: 'kintsugi',
  // //   to: 'karura',
  // //   token: 'KBTC',
  // //   fee: 0.008012799999999931
  // // },

  // {
  //   from: 'crab',
  //   to: 'karura',
  //   token: 'CRAB',
  // },
  // {
  //   from: 'khala',
  //   to: 'karura',
  //   token: 'KUSD',
  // },
  // {
  //   from: 'karura',
  //   to: 'khala',
  //   token: 'KUSD',
  // },
  // Chopsticks are currently not supported.
  // {
  //   from: 'crust',
  //   to: 'karura',
  //   token: 'CSM',
  //   fee: 0.008082399999999934
  // },
  // {
  //   from: 'karura',
  //   to: 'crust',
  //   token: 'CSM',
  //   fee: 0.002080000000000082
  // },
  // {
  //   from: 'unique',
  //   to: 'acala',
  //   token: 'UNQ',
  //   fee: 0.008082399999999934
  // },
  // {
  //   from: 'quartz',
  //   to: 'karura',
  //   token: 'QTZ',
  // },
  // {
  //   from: 'karura',
  //   to: 'quartz',
  //   token: 'QTZ',
  // },
] as const

buildTests(tests)
