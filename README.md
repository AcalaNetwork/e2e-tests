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

## Check compatibility with upcoming runtime

If you don't expect breaking change, simply add `{NETWORK}_WASM=wasm/runtime/path` to `.env` file to override the runtime and run the tests.

If there are expected breaking change, you can add a new network with the new runtime and add new tests using the new network. Check other tests as a reference.

## Contributing

This repo is using [vitest](https://vitest.dev) as the test runner. Most of the tests are written as [snapshot tests](https://vitest.dev/guide/snapshot.html). The test will run and save the result as snapshot in a `.snap` file, and next time when the test runs again, it will compare the result with the snapshot. This eliminates the need to write assertions and make the test more readable.

There is [periodic check](https://github.com/AcalaNetwork/e2e-tests/actions/workflows/check.yml) Github Action to run the tests against latest mainnet block to detect compatibility issues with live networks.

It is recommended use `yarn update-env` to update the `.env` file with latest block number before running the tests. This ensures tests are always running against the same blocks so that block data can be cached and reused to speed up test running time. Once you have a working test, update the blocks number again and rerun the tests to ensure the tests are block number indpendent. Use `redact` and event filters to make the snapshot be consistent regardless the block number.

### Files

- [networks](./networks) - network configs
- [tests](./tests) - tests
- [wasm](./wasm) - wasm runtime files to test compatibility with upcoming versions

### Debugging Tips

- Move the failed test to [playground.test.ts](./tests/xcm-transfer/playground.test.ts) to only run the failed test.
- Use `yarn vitest` instead of `yarn test` to display logs.
- Add `-u` to automatically update snapshots and use git diff tool to compare the changes.
- For failed CI tests, check the block numbers from the `update-env` steps in the logs to local `.env` file to be able to run the tests with the same block height.
- Remove the system events filter to see all the events in snapshots.
	- e.g. Replace `checkSystemEvents(toChain, 'parachainSystem', 'dmpQueue')` to `checkSystemEvents(toChain)`
- Insert `await chain.pause()` to pause the test and inspect the Chopsticks instance in the console. The connection details will be displayed in the console log.
	- Edit the timeout in `vitest.config.ts` to avoid timeout error.
	- Try log the extrinsic hex and replay it in the Chopsticks instance to debug the issue.
- Try replicate the issue in Chopsticks directly to create a minimal reproducible case.
- Once you are able to reproduce the issue in Chopsticks, you may add bunch logs in the runtime and make a wasm and override it. Then use `--runtime-log-level 5` to display logs.

### Writing tests

#### Add new network

- Create new network config in [networks](./networks) folder.
- Update [networks/all.ts](./networks/all.ts) to include the new network.
- Add Subway config in [scripts/configs](./scripts/configs) folder.
- Update [run-all.sh](./scripts/run-all.sh) to include the new network.

#### Add new xcm test

- Checkout other tests as a reference and see if you can find something similar as a base case.
- Starts writing in [playground.test.ts](./tests/xcm-transfer/playground.test.ts) and move to the appropriate test file once it is ready.
- Add `-u` to automatically update snapshots and manually inspect the generated snapshot file to ensure it is expected.

### Environment variables

- `{NETWORK_NAME}_BLOCK_NUMBER` - block number to run tests against
- `{NETWORK_NAME}_ENDPOINT` - endpoint to connect to
- `{NETWORK_NAME}_WASM` - override wasm runtime
- `DB_URL` - path to db file for caching

Example `.env` file

```
POLKADOT_BLOCK_NUMBER=15943997
KUSAMA_BLOCK_NUMBER=18333291
POLKADOT9420_BLOCK_NUMBER=15943997
KUSAMA9420_BLOCK_NUMBER=18333291
STATEMINT_BLOCK_NUMBER=3956812
STATEMINE_BLOCK_NUMBER=4689863
ACALA_BLOCK_NUMBER=3785107
KARURA_BLOCK_NUMBER=4535779
ASTAR_BLOCK_NUMBER=3776318
SHIDEN_BLOCK_NUMBER=4203165
ACALA2180_BLOCK_NUMBER=3785107
KARURA2180_BLOCK_NUMBER=4535779
MOONBEAM_BLOCK_NUMBER=3769096
MOONRIVER_BLOCK_NUMBER=4446853
HYDRADX_BLOCK_NUMBER=2750787
BASILISK_BLOCK_NUMBER=3559987
BIFROSTPOLKADOT_BLOCK_NUMBER=2522864
BIFROST_BLOCK_NUMBER=4361576
ALTAIR_BLOCK_NUMBER=3282796
CENTRIFUGE_BLOCK_NUMBER=3161458
PARALLEL_BLOCK_NUMBER=3706152
HEIKO_BLOCK_NUMBER=3710234


ACALA_ENDPOINT=ws://0.0.0.0:9000
ACALA2180_ENDPOINT=ws://0.0.0.0:9000
KARURA_ENDPOINT=ws://0.0.0.0:9001
KARURA2180_ENDPOINT=ws://0.0.0.0:9001
KUSAMA_ENDPOINT=ws://0.0.0.0:9002
KUSAMA9420_ENDPOINT=ws://0.0.0.0:9002
POLKADOT_ENDPOINT=ws://0.0.0.0:9003
POLKADOT9420_ENDPOINT=ws://0.0.0.0:9003
STATEMINE_ENDPOINT=ws://0.0.0.0:9004
STATEMINT_ENDPOINT=ws://0.0.0.0:9005
BASILISK_ENDPOINT=ws://0.0.0.0:9006
HYDRADX_ENDPOINT=ws://0.0.0.0:9007
MOONBREAM_ENDPOINT=ws://0.0.0.0:9008
MOONRIVER_ENDPOINT=ws://0.0.0.0:9009
ASTAR_BLOCK_ENDPOINT=ws://0.0.0.0:9010
SHIDEN_BLOCK_ENDPOINT=ws://0.0.0.0:9011
BIFROST_BLOCK_ENDPOINT=ws://0.0.0.0:9012
ALTAIR_BLOCK_ENDPOINT=ws://0.0.0.0:9013
HEIKO_BLOCK_ENDPOINT=ws://0.0.0.0:9014
BIFROSTPOLKADOT_BLOCK_ENDPOINT=ws://0.0.0.0:9015
PARALLEL_BLOCK_ENDPOINT=ws://0.0.0.0:9016
CENTRIFUGE_BLOCK_ENDPOINT=ws://0.0.0.0:9017

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
