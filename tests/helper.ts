import { AccountInfo } from '@polkadot/types/interfaces'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { BuildBlockMode, setupWithServer } from '@acala-network/chopsticks'
import { Codec } from '@polkadot/types/types'
import { HexString } from '@polkadot/util/types'
import { Keyring } from '@polkadot/keyring'
import { StorageValues } from '@acala-network/chopsticks/dist/utils/set-storage'
import { expect } from 'vitest'

export type SetupOption = {
  endpoint: string
  blockNumber?: number
  blockHash?: HexString
  mockSignatureHost?: boolean
}

export const setupContext = async ({ endpoint, blockNumber, blockHash, mockSignatureHost }: SetupOption) => {
  const port = 8000
  const config = {
    endpoint,
    port,
    block: blockNumber || blockHash,
    mockSignatureHost,
    'build-block-mode': BuildBlockMode.Manual,
  }
  const { chain, listenPort, close } = await setupWithServer(config)

  const ws = new WsProvider(`ws://localhost:${listenPort}`)
  const api = await ApiPromise.create({
    provider: ws,
    signedExtensions: {
      SetEvmOrigin: {
        extrinsic: {},
        payload: {},
      },
    },
  })

  await api.isReady

  return {
    chain,
    ws,
    api,
    dev: {
      newBlock: (param?: { count?: number; to?: number }): Promise<string> => {
        return ws.send('dev_newBlock', [param])
      },
      setStorage: (values: StorageValues, blockHash?: string) => {
        return ws.send('dev_setStorage', [values, blockHash])
      },
      timeTravel: (date: string | number) => {
        return ws.send<number>('dev_timeTravel', [date])
      },
      setHead: (hashOrNumber: string | number) => {
        return ws.send('dev_setHead', [hashOrNumber])
      },
    },
    async teardown() {
      await api.disconnect()
      await close()
    },
  }
}

type CodecOrArray = Codec | Codec[]

export const matchSnapshot = (codec: CodecOrArray | Promise<CodecOrArray>, message?: string) => {
  return expect(
    Promise.resolve(codec).then((x) => (Array.isArray(x) ? x.map((x) => x.toHuman()) : x.toHuman()))
  ).resolves.toMatchSnapshot(message)
}

export const expectEvent = async (codec: Codec | Promise<Codec>, event: any) => {
  return expect(await Promise.resolve(codec).then((x) => x.toHuman())).toEqual(
    expect.arrayContaining([expect.objectContaining(event)])
  )
}

export const balance = async (api: ApiPromise, address: string) => {
  const account = await api.query.system.account<AccountInfo>(address)
  return account.data.toHuman()
}

export const testingPairs = (ss58Format?: number) => {
  const keyring = new Keyring({ type: 'ed25519', ss58Format }) // cannot use sr25519 as it is non determinstic
  const alice = keyring.addFromUri('//Alice')
  const bob = keyring.addFromUri('//Bob')
  const charlie = keyring.addFromUri('//Charlie')
  const dave = keyring.addFromUri('//Dave')
  const eve = keyring.addFromUri('//Eve')
  const test1 = keyring.addFromUri('//test1')
  const test2 = keyring.addFromUri('//test2')
  return {
    alice,
    bob,
    charlie,
    dave,
    eve,
    test1,
    test2,
    keyring,
  }
}
