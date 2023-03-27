import { ApiPromise } from '@polkadot/api'
import { Checker, EventFilter } from '..'

export const xtokens = {
  transferV2:
    (token: any, amount: any, dest: (dest: any) => any) =>
    ({ api }: { api: ApiPromise }, acc: any) =>
      api.tx.xTokens.transfer(token, amount, dest(acc), 'Unlimited'),
}

export const xcm = {
  nativeToken: { Concrete: { parents: 0, interior: 'Here' } },
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
  parachainV2: (paraId: any) => ({
    V1: {
      parents: 0,
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
}

export const xcmPallet = {
  limitedReserveTransferAssetsV2:
    (token: any, amount: any, dest: any) =>
    ({ api }: { api: ApiPromise }, acc: any) =>
      api.tx.xcmPallet.limitedReserveTransferAssets(
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
      api.tx.xcmPallet.limitedReserveTransferAssets(
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

export const queryBalances = ({ api }: { api: ApiPromise }, address: string) => api.query.system.account(address)
export const queryTokens =
  (token: any) =>
  ({ api }: { api: ApiPromise }, address: string) =>
    api.query.tokens.accounts(address, token)

export const filterEvents =
  (...filters: EventFilter[]) =>
  (checker: Checker) =>
    checker.filterEvents(...filters).redact()
