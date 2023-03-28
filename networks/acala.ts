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
        account: [[[alice.address], { data: { free: 10 * 1e12 } }]],
      },
      Tokens: {
        accounts: [
          [[alice.address, { Token: relayToken }], { free: 10 * 1e12 }],
          [[alice.address, { Token: relayLiquidToken }], { free: 100 * 1e12 }],
        ],
      },
      Sudo: {
        key: alice.address,
      },
      Homa: {
        // avoid impact test outcome
        $removePrefix: ['redeemRequests', 'unbondings', 'toBondPool'],
        // so that bump era won't trigger unbond
        relayChainCurrentEra: '0x64000000',
      },
      EvmAccounts: {
        accounts: [[['0x82a258cb20e2adb4788153cd5eb5839615ece9a0'], alice.address]],
        evmAddresses: [[[alice.address], '0x82a258cb20e2adb4788153cd5eb5839615ece9a0']],
      },
    },
  }),
} satisfies Config<Vars>

export const acala = {
  paraId: 2000,
  dot: { Token: 'DOT' },
  dai: { Erc20: '0x54a37a01cd75b616d63e0ab665bffdb0143c52ae' },
} as const

export const karura = {
  paraId: 2000,
  ksm: { Token: 'KSM' },
  usdt: { ForeignAsset: 7 },
} as const
