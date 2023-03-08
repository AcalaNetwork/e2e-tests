import { ApiPromise } from '@polkadot/api'

export const queryBalance = (api: ApiPromise, address: string) => {
  return api.query.system.account(address)
}

export const queryTokenBalance = (api: ApiPromise, token: object, address: string) => {
  return api.query.tokens.accounts(address, token)
}

export const queryRedeemRequests = (api: ApiPromise, address: string) => {
  return api.query.homa.redeemRequests(address)
}
