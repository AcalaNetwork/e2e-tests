import { Config } from './types'

type Vars = {
  relayToken: string
  relayLiquidToken: string
}

export default {
  polkadot: {
    name: 'acala' as const,
    endpoint: 'wss://acala-rpc-0.aca-api.network',
    relayToken: 'DOT',
    relayLiquidToken: 'LDOT',
  },
  kusama: {
    name: 'karura' as const,
    endpoint: 'wss://karura-rpc-0.aca-api.network',
    relayToken: 'KSM',
    relayLiquidToken: 'LKSM',
  },
  config: ({ alice, relayToken, relayLiquidToken }) => ({
    storages: {
      System: {
        Account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
      Tokens: {
        Accounts: [
          [[alice.address, { Token: relayToken }], { free: 10 * 1e12 }],
          [[alice.address, { Token: relayLiquidToken }], { free: 100 * 1e12 }],
        ],
      },
      Sudo: {
        Key: alice.address,
      },
      Homa: {
        // avoid impact test outcome
        $removePrefix: ['redeemRequests', 'unbondings', 'toBondPool'],
        // so that bump era won't trigger unbond
        relayChainCurrentEra: '0x64000000',
      },
    },
  }),
} satisfies Config<Vars>

export const acala = {
  dot: { Token: 'DOT' },
  wbtc: { ForeignAsset: 5 },
}

export const karura = {
  ksm: { Token: 'KSM' },
  usdt: { ForeignAsset: 7 },
}
