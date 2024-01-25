import { buildTests } from './shared'

const tests = [
  {
    from: 'acala',
    to: 'polkadot',
    token: 'DOT',
  },
  {
    from: 'polkadot',
    to: 'acala',
    token: 'DOT',
  },
  {
    from: 'polkadot',
    to: 'statemint',
    token: 'DOT',
  },
  {
    from: 'statemint',
    to: 'polkadot',
    token: 'DOT',
  },
  {
    from: 'acala',
    to: 'moonbeam',
    token: 'AUSD',
  },
  {
    from: 'astar',
    to: 'acala',
    token: 'AUSD',
  },
  {
    from: 'acala',
    to: 'astar',
    token: 'AUSD',
  },
  {
    from: 'interlay',
    to: 'acala',
    token: 'INTR',
  },
  {
    from: 'acala',
    to: 'interlay',
    token: 'INTR',
  },
  // btc
  // {
  //   from: 'interlay',
  //   to: 'acala',
  //   token: 'IBTC',
  //   fee: 0.008012799999999931
  // },
  // {
  //   from: 'acala',
  //   to: 'interlay',
  //   token: 'IBTC',
  //   fee: 0.008012799999999931
  // },

  // RpcError: 1: Error: createType(Lookup4):: Unable to construct number from multi-key object
  // {
  //   from: 'parallel',
  //   to: 'acala',
  //   token: 'PARA',
  // },
  // {
  //   from: 'acala',
  //   to: 'parallel',
  //   token: 'PARA',
  // },
  // {
  //   from: 'parallel',
  //   to: 'acala',
  //   token: 'ACA',
  // },
  // {
  //   from: 'acala',
  //   to: 'parallel',
  //   token: 'ACA',
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
] as const

buildTests(tests)
