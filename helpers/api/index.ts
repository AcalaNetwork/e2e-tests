import { ApiPromise } from '@polkadot/api'

export const xtokens = {
  relaychainV2: (acc: any) => ({
    V1: {
      parents: 1,
      interior: {
        X1: {
          AccountId32: {
            network: 'Any',
            id: acc,
          },
        },
      },
    },
  }),
  parachainV2: (paraId: number) => (acc: any) => ({
    V1: {
      parents: 1,
      interior: {
        X2: [
          { Parachain: paraId },
          {
            AccountId32: {
              network: 'Any',
              id: acc,
            },
          },
        ],
      },
    },
  }),
  transferV2:
    (token: any, amount: any, dest: (dest: any) => any) =>
    ({ api }: { api: ApiPromise }, acc: any) =>
      api.tx.xTokens.transfer(token, amount, dest(acc), 'Unlimited'),
}

export const xcmPallet = {
  parachainV2: (parents: number, paraId: number) => ({
    V1: {
      parents: parents,
      interior: {
        X1: { Parachain: paraId },
      },
    },
  }),
  relaychainV3: (acc: any) => ({
    V3: {
      parents: 1,
      interior: {
        X1: {
          AccountId32: {
            network: 'Any',
            id: acc,
          },
        },
      },
    },
  }),
  parachainV3: (paraId: any) => ({
    V3: {
      parents: 0,
      interior: {
        X1: { Parachain: paraId },
      },
    },
  }),
  limitedReserveTransferAssetsV2:
    (token: any, amount: any, dest: any) =>
    ({ api }: { api: ApiPromise }, acc: any) =>
      (api.tx.xcmPallet || api.tx.polkadotXcm).limitedReserveTransferAssets(
        dest,
        {
          V1: {
            parents: 0,
            interior: {
              X1: {
                AccountId32: {
                  id: acc,
                },
              },
            },
          },
        },
        {
          V1: [
            {
              id: token,
              fun: { Fungible: amount },
            },
          ],
        },
        0,
        'Unlimited'
      ),
  limitedReserveTransferAssetsV3:
    (token: any, amount: any, dest: any) =>
    ({ api }: { api: ApiPromise }, acc: any) =>
      (api.tx.xcmPallet || api.tx.polkadotXcm).limitedReserveTransferAssets(
        dest,
        {
          V3: {
            parents: 0,
            interior: {
              X1: {
                AccountId32: {
                  id: acc,
                },
              },
            },
          },
        },
        {
          V3: [
            {
              id: token,
              fun: { Fungible: amount },
            },
          ],
        },
        0,
        'Unlimited'
      ),
}

export const tx = {
  xtokens,
  xcmPallet,
}

export const query = {
  balances: ({ api }: { api: ApiPromise }, address: string) => api.query.system.account(address),
  tokens:
    (token: any) =>
    ({ api }: { api: ApiPromise }, address: string) =>
      api.query.tokens.accounts(address, token),
  assets:
    (token: number) =>
    ({ api }: { api: ApiPromise }, address: string) =>
      api.query.assets.account(token, address),
}
