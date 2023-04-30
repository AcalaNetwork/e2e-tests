import { it } from 'vitest'

// import { query, tx } from '../../helpers/api'

// import { acala } from '../../networks/acala'
// import { hydraDX } from '../../networks/hydraDX'
// import { moonbeam } from '../../networks/moonbeam'
// import { statemint } from '../../networks/statemint'

// import { Context } from '../../networks/types'

import buildTest from './shared'

// Use this file to write new tests so you can run it without running all other tests
// Move the tests to approapriate file when you are done

const tests = [] as const

export type TestType = (typeof tests)[number]

buildTest(tests)

it('makes vitest happy when no tests in ths file', () => {})
