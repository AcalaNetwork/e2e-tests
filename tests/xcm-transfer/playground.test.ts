import { it } from 'vitest'

// import { Context } from '../../networks/types'
// import { query, tx } from '../../helpers/api'

// import { acala , karura } from '../../networks/acala'
// import { basilisk , hydraDX } from '../../networks/hydraDX'
// import { kusama, polkadot } from '../../networks/polkadot'
// import { moonbeam } from '../../networks/moonbeam'
// import { statemine , statemint } from '../../networks/statemint'

import buildTest from './shared'

// Use this file to write new tests so you can run it without running all other tests
// Move the tests to approapriate file when you are done

const tests = [] as const

export type TestType = (typeof tests)[number]

buildTest(tests)

it('makes vitest happy when no tests in ths file', () => {})
