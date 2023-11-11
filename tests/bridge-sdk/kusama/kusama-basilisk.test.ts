import { bridgeSDKTest } from '../shared'

bridgeSDKTest({
  from: 'kusama',
  to: 'basilisk',
  token: 'KSM',
  ignoreFee: true,
})
