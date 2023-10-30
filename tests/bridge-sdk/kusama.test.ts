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
  {
    from: 'basilisk',
    to: 'kusama',
    token: 'KSM',
  },
  {
    from: 'statemine',
    to: 'kusama',
    token: 'KSM',
  },
  {
    from: 'kusama',
    to: 'statemine',
    token: 'KSM',
  },
  {
    from: 'basilisk',
    to: 'karura',
    token: 'BSX',
  },
  // {
  //   from: 'karura',
  //   to: 'basilisk',
  //   token: 'KUSD',
  // },
  {
    from: 'karura',
    to: 'moonriver',
    token: 'KAR',
  },
  {
    from: 'karura',
    to: 'bifrost',
    token: 'KUSD',
  },
  {
    from: 'bifrost',
    to: 'karura',
    token: 'BNC',
  },
  {
    from: 'altair',
    to: 'karura',
    token: 'KUSD',
  },
  {
    from: 'karura',
    to: 'altair',
    token: 'KUSD',
  },
  {
    from: 'altair',
    to: 'karura',
    token: 'AIR',
  },
  {
    from: 'karura',
    to: 'altair',
    token: 'AIR',
  },
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

  {
    from: 'karura',
    to: 'heiko',
    token: 'KAR',
  },
  {
    from: 'heiko',
    to: 'karura',
    token: 'HKO',
  },
  // {
  //   from: 'crab',
  //   to: 'karura',
  //   token: 'CRAB',
  // },
  {
    from: 'khala',
    to: 'karura',
    token: 'KUSD',
  },
  {
    from: 'karura',
    to: 'khala',
    token: 'KUSD',
  },
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
  //   fee: 0.008082399999999934
  // },
  // {
  //   from: 'karura',
  //   to: 'quartz',
  //   token: 'QTZ',
  //   fee: 0.002080000000000082
  // },
] as const

buildTests(tests)
