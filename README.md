# e2e-tests

End to end tests for Acala and Karura.

Tests are powered by [Chopsticks](http://github.com/AcalaNetwork/chopsticks) to always run with latest mainnet block.

## Running tests

All tests:
`yarn test`

Run one test only:
`yarn test ./tests/xcm-transfer/kusama-relay.test.ts`

## Environment variables

- `{NETWORK_NAME}_BLOCK_NUMBER` - block number to run tests against
- `{NETWORK_NAME}_ENDPOINT` - endpoint to connect to
- `DB_URL` - path to db file for caching

Example `.env` file

```
POLKADOT_BLOCK_NUMBER=15052153
KUSAMA_BLOCK_NUMBER=17443980
POLKADOT9381_BLOCK_NUMBER=15052153
KUSAMA9381_BLOCK_NUMBER=17443980
STATEMINT_BLOCK_NUMBER=3609016
STATEMINE_BLOCK_NUMBER=4263656
ACALA_BLOCK_NUMBER=3342960
KARURA_BLOCK_NUMBER=4103523
ACALA2160_BLOCK_NUMBER=3342960
KARURA2160_BLOCK_NUMBER=4103523
MOONBEAM_BLOCK_NUMBER=3334880
MOONRIVER_BLOCK_NUMBER=4017536
HYDRADX_BLOCK_NUMBER=2328334
BASILISK_BLOCK_NUMBER=3144786

ACALA_ENDPOINT=ws://0.0.0.0:9000
ACALA2160_ENDPOINT=ws://0.0.0.0:9000
KARURA_ENDPOINT=ws://0.0.0.0:9001
KARURA2160_ENDPOINT=ws://0.0.0.0:9001
KUSAMA_ENDPOINT=ws://0.0.0.0:9002
KUSAMA9381_ENDPOINT=ws://0.0.0.0:9002
POLKADOT_ENDPOINT=ws://0.0.0.0:9003
POLKADOT9381_ENDPOINT=ws://0.0.0.0:9003
STATEMINE_ENDPOINT=ws://0.0.0.0:9004
STATEMINT_ENDPOINT=ws://0.0.0.0:9005
BASILISK_ENDPOINT=ws://0.0.0.0:9006
HYDRADX_ENDPOINT=ws://0.0.0.0:9007
MOONBREAM_ENDPOINT=ws://0.0.0.0:9008
MOONRIVER_ENDPOINT=ws://0.0.0.0:9009

DB_PATH=./db.sqlite
```

Use specific block number for tests and db cache can signficantly improve test running speed.

Run `yarn update-env` to update .env file with latest block number.

To debug failing tests on CI, find the block number config from CI log and put them in .env to run the test with the same block height.

### Use Subway to catch RPC responses

Use [subway](http://github.com/AcalaNetwork/subway) to run local endpoints to catch RPC responses for additonal improved test running speed.

- Install Subway: `cargo install --git https://github.com/AcalaNetwork/subway.git`
- Run: `./scripts/run-all.sh`

## To do
1. Enhance XCM tests by using Bridge SDK in additonal to Polkadot.js
