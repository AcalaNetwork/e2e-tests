import { AccountInfo } from '@polkadot/types/interfaces'
import { ApiPromise } from '@polkadot/api'

export const balance = async (api: ApiPromise, address: string) => {
  const account = await api.query.system.account<AccountInfo>(address)
  return account.data.toJSON()
}

export const xTokensForRelayChain = (api: ApiPromise, amount: string, address: Uint8Array) => {
  return api.tx.xTokens.transfer(
    {
      Token: 'KSM',
    },
    amount,
    {
      V1: {
        parents: 1,
        interior: {
          X1: {
            AccountId32: {
              network: 'Any',
              id: address,
            },
          },
        },
      },
    },
    'Unlimited'
  )
}

export const xTokensForParaChain = (
  api: ApiPromise,
  token: object,
  parachainId: string,
  amount: string,
  address: Uint8Array
) => {
  return api.tx.xTokens.transfer(
    token,
    amount,
    {
      V1: {
        parents: 1,
        interior: {
          X2: [
            {
              Parachain: parachainId,
            },
            {
              AccountId32: {
                network: 'Any',
                id: address,
              },
            },
          ],
        },
      },
    },
    'Unlimited'
  )
}

export const xTokens = (
  api: ApiPromise,
  isRelayChain: boolean,
  parachainId: string,
  token: object,
  amount: string,
  address: Uint8Array
) => {
  const multiLocation = isRelayChain
    ? { X1: { AccountId32: { network: 'Any', id: address } } }
    : {
        X2: [
          {
            Parachain: parachainId,
          },
          {
            AccountId32: {
              network: 'Any',
              id: address,
            },
          },
        ],
      }

  return api.tx.xTokens.transfer(
    token,
    amount,
    {
      V1: {
        parents: 1,
        interior: multiLocation,
      },
    },
    'Unlimited'
  )
}
