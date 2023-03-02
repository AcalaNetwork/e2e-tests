import { AccountInfo } from '@polkadot/types/interfaces'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { BuildBlockMode, setupWithServer } from '@acala-network/chopsticks'
import { Codec } from '@polkadot/types/types'
import { HexString } from '@polkadot/util/types'
import { Keyring } from '@polkadot/keyring'
import { StorageValues } from '@acala-network/chopsticks/lib/utils/set-storage'
import { SubmittableExtrinsic } from '@polkadot/api-base/types'
import { expect } from 'vitest'

export type SetupOption = {
  endpoint: string
  blockNumber?: number
  blockHash?: HexString
  wasmOverride?: string
  db?: string
}

export const setupContext = async ({ endpoint, blockNumber, blockHash, wasmOverride, db }: SetupOption) => {
  // random port
  const port = Math.floor(Math.random() * 10000) + 10000
  const config = {
    endpoint,
    port,
    block: blockNumber || blockHash,
    mockSignatureHost: true,
    'build-block-mode': BuildBlockMode.Manual,
    db,
    'wasm-override': wasmOverride,
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

const processCodecOrArray = (codec: CodecOrArray, fn: (c: Codec) => any) =>
  Array.isArray(codec) ? codec.map(fn) : fn(codec)

const toHuman = (codec: CodecOrArray) => processCodecOrArray(codec, (c) => c?.toHuman?.() ?? c)
const toJson = (codec: CodecOrArray) => processCodecOrArray(codec, (c) => c?.toJSON?.() ?? c)
const toHex = (codec: CodecOrArray) => processCodecOrArray(codec, (c) => c?.toHex?.() ?? c)

export const matchSnapshot = (codec: CodecOrArray | Promise<CodecOrArray>, message?: string) => {
  return expect(Promise.resolve(codec).then(toHuman)).resolves.toMatchSnapshot(message)
}

export const expectEvent = (codec: CodecOrArray, event: any) => {
  return expect(toHuman(codec)).toEqual(expect.arrayContaining([expect.objectContaining(event)]))
}

export const expectHuman = (codec: CodecOrArray) => {
  return expect(toHuman(codec))
}

export const expectJson = (codec: CodecOrArray) => {
  return expect(toJson(codec))
}

export const expectHex = (codec: CodecOrArray) => {
  return expect(toHex(codec))
}

type EventFilter = string | { method: string; section: string }

const _matchEvents = async (msg: string, events: Promise<Codec[] | Codec>, ...filters: EventFilter[]) => {
  let data = toHuman(await events).map(({ event: { index: _, ...event } }: any) => event)
  if (filters.length > 0) {
    const filtersArr = Array.isArray(filters) ? filters : [filters]
    data = data.filter((evt: any) => {
      return filtersArr.some((filter) => {
        if (typeof filter === 'string') {
          return evt.section === filter
        }
        const { section, method } = filter
        return evt.section === section && evt.method === method
      })
    })
  }
  return expect(data).toMatchSnapshot(msg)
}

export const matchEvents = async (events: Promise<Codec[] | Codec>, ...filters: EventFilter[]) => {
  return _matchEvents('events', redact(events), ...filters)
}

export const matchSystemEvents = async ({ api }: { api: ApiPromise }, ...filters: EventFilter[]) => {
  await _matchEvents('system events', redact(api.query.system.events()), ...filters)
}

export const matchUmp = async ({ api }: { api: ApiPromise }) => {
  expect(await api.query.parachainSystem.upwardMessages()).toMatchSnapshot('ump')
}

export const matchHrmp = async ({ api }: { api: ApiPromise }) => {
  expect(await api.query.parachainSystem.hrmpOutboundMessages()).toMatchSnapshot('hrmp')
}

export const redact = async (data: any | Promise<any>) => {
  const json = toHuman(await data)

  const process = (obj: any): any => {
    if (obj == null) {
      return obj
    }
    if (Array.isArray(obj)) {
      return obj.map(process)
    }
    if (typeof obj === 'number') {
      return '(redacted)'
    }
    if (typeof obj === 'string') {
      if (obj.match(/^[\d,]+$/) || obj.match(/0x[0-9a-f]{64}/)) {
        return '(redacted)'
      }
      return obj
    }
    if (typeof obj === 'object') {
      return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, process(v)]))
    }
    return obj
  }

  return process(json)
}

export const expectExtrinsicSuccess = (events: Codec[]) => {
  expectEvent(events, {
    event: expect.objectContaining({
      method: 'ExtrinsicSuccess',
      section: 'system',
    }),
  })
}

export function defer<T>() {
  const deferred = {} as { resolve: (value: any) => void; reject: (reason: any) => void; promise: Promise<T> }
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })
  return deferred
}

export const sendTransaction = async (tx: Promise<SubmittableExtrinsic<'promise'>>) => {
  const signed = await tx
  const deferred = defer<Codec[]>()
  await signed.send((status) => {
    if (status.isCompleted) {
      deferred.resolve(status.events)
    }
    if (status.isError) {
      deferred.reject(status.status)
    }
  })

  return {
    events: deferred.promise,
  }
}

export const balance = async (api: ApiPromise, address: string) => {
  const account = await api.query.system.account<AccountInfo>(address)
  return account.data.toJSON()
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
