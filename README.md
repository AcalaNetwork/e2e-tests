# e2e-tests

## Tests

### Runtime testing
1. Runtime migrations (initialize debit_pool_offset_buffer)
2. Produce block
3. Basic transactions
4. dApps compatibility
4.1. Honzon
4.2. Homa
4.3. Swap
4.4. Incentive
4.5. XCM in  ： relaychain -> parachain,  parachain -> parachain
4.6. XCM out ： parachain -> relaychain(partially validation), parachain -> parachain
4.7 Portfolio page token balance

5. Oracle
6. Polkawallet
7. EVM+
7.1. eth-rpc-adapter
7.2. evm-subql (not directly testable, usually works when rpc adapter work）
7.3. wormhole (not directly testable, requires guardians. Can do some indirect testing) Note: Tested Bodhi with Mandala 2120
8. Ledger (through Polkadot.js)
8.1. Transfer (both from/to Ledger account)
8.2. Cross-chain transfer (both from/to Ledger account) ( not working ) 
8.3. Dex Swap
8.4. Honzon create/close vault, mint/payback aUSD
8.5. Incentive stake/unstake/claim
8.6. Homa Liquid Staking Stake/Unstake
9. sidecar
9.1. Get block with various transactions

### XCM tests

## To do
1. Enhance XCM tests by using Bridge SDK instead of Polkadot.js - i.e. full e2e
