import fs from 'fs'

import { ApiPromise, WsProvider } from '@polkadot/api'
import networkDefs from '../networks/all'

const readEnvFile = () => {
  try {
    return fs.readFileSync('.env', 'utf8').toString()
  } catch (_err) {
    return ''
  }
}

const main = async () => {
  let envFile = readEnvFile()

  // comment out current ones
  envFile = envFile.replaceAll(/(^[A-Z0-9]+_BLOCK_NUMBER=\d+)/gm, '# $1')

  // prepend new ones
  const blockNumbers: Promise<string>[] = []
  for (const { polkadot, kusama } of Object.values(networkDefs)) {
    for (const { name, endpoint } of [polkadot, kusama]) {
      const fn = async () => {
        const api = await ApiPromise.create({ provider: new WsProvider(endpoint), noInitWarn: true })
        const header = await api.rpc.chain.getHeader()
        const blockNumber = header.number.toNumber()
        return `${name.toUpperCase()}_BLOCK_NUMBER=${blockNumber}`
      }
      blockNumbers.push(fn())
    }
  }

  const blockNumbersStr = (await Promise.all(blockNumbers)).join('\n')

  envFile = blockNumbersStr + '\n\n' + envFile

  console.log(blockNumbersStr)

  fs.writeFileSync('.env', envFile)
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
