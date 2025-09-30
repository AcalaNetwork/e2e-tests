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
    from: 'acala',
    to: 'assetHubPolkadot',
    token: 'USDT',
  },
  {
    from: 'assetHubPolkadot',
    to: 'acala',
    token: 'USDT',
  },
  {
    from: 'polkadot',
    to: 'assetHubPolkadot',
    token: 'DOT',
  },
  {
    from: 'assetHubPolkadot',
    to: 'polkadot',
    token: 'DOT',
  },
  // {
  //   from: 'acala',
  //   to: 'moonbeam',
  //   token: 'AUSD',
  // },
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
] as const

buildTests(tests)
