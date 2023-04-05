# e2e-tests

End to end tests for Acala and Karura.

Tests are powered by [Chopsticks](http://github.com/AcalaNetwork/chopsticks) to always run with latest mainnet block.

## Running tests

All tests:
`yarn test`

Run one test only:
`yarn test ./tests/xcm-transfer/kusama-relay.test.ts`

Or you can just use a keywork since it is using vitest and use regex to find tests:
`yarn test xcm`

## Environment variables

- `{NETWORK_NAME}_BLOCK_NUMBER` - block number to run tests against
- `{NETWORK_NAME}_ENDPOINT` - endpoint to connect to
- `DB_URL` - path to db file for caching

Example `.env` file

```
POLKADOT_BLOCK_NUMBER=14849217
STATEMINT_BLOCK_NUMBER=3508258
ACALA_BLOCK_NUMBER=3242473
MOONBEAM_BLOCK_NUMBER=3240069
HYDRADX_BLOCK_NUMBER=2231445
KUSAMA_BLOCK_NUMBER=17242189
STATEMINE_BLOCK_NUMBER=4166043
KARURA_BLOCK_NUMBER=4004377
MOONRIVER_BLOCK_NUMBER=3920858
BASILISK_BLOCK_NUMBER=3049988

ACALA_ENDPOINT=ws://0.0.0.0:9000
KARURA_ENDPOINT=ws://0.0.0.0:9001
KUSAMA_ENDPOINT=ws://0.0.0.0:9002
POLKADOT_ENDPOINT=ws://0.0.0.0:9003
STATEMINE_ENDPOINT=ws://0.0.0.0:9004
STATEMINT_ENDPOINT=ws://0.0.0.0:9005
BASILISK_ENDPOINT=ws://0.0.0.0:9006
HYDRADX_ENDPOINT=ws://0.0.0.0:9007
MOONBREAM_ENDPOINT=ws://0.0.0.0:9008
MOONRIVER_ENDPOINT=ws://0.0.0.0:9009

DB_PATH=./db.sqlite
```

Use specific block number for tests and db cache can signficantly improve test running speed.

### Use Subway to catch RPC responses

Use [subway](http://github.com/AcalaNetwork/subway) to run local endpoints to catch RPC responses for additonal improved test running speed.

- Install Subway: `cargo install --git https://github.com/AcalaNetwork/subway.git`
- Run: `./scripts/run-all.sh`

## To do
1. Enhance XCM tests by using Bridge SDK in additonal to Polkadot.js
