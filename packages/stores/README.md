# @osmosis-labs/stores

Contains observable stores via [`mobx`](https://mobx.js.org/README.html) data storage framework.

Components:

- OsmosisAccount: account store creator (`use`). Creates mobx object mapped to chain IDs with:
  - Keplr wallet connection status, bech32Address
  - Cosmos messages
  - Cosmwasm contract execute message
  - Osmosis messages
- CurrencyRegistrar: maps IBC denoms to human readable denoms into `ChainStore` objects
- Data: Provides wrapper stores that compute on data in the lower-level query stores.
- IbcHistory: stores IBC transfer transactoin state in `localStorage` for some time, including pending status
- Price: maps coin denoms to price info (currently CoinGecko, with a fallback to pool data for tokens not on CoinGecko)
- Queries: queries and computes on Osmosis chain data
- QueriesExternal: queries and computes on external APIs. e.g. Imperator historical chain data & price API.
- Tx: stores utilities for sending IBC transfer message and working with transaction result objects originating from Keplr
- UIConfig: contains various stores for UI state related to common Osmosis frontend user activites: choosing lock duration, adding/removing liquidity, creating pool, choosing a token amount, trading token in, etc.

## Local Osmosis E2E Tests

1. **Ensure `osmosisd` is Set Up**: Follow the instructions in the [localosmosis README](https://github.com/osmosis-labs/osmosis/blob/main/tests/localosmosis/README.md) on the Osmosis repo to ensure you have osmosisd correctly set up.

2. **Checkout and Build the Correct Version of Your Local Osmosis Repo**: Make sure you are using the correct version of the Osmosis repository. You can do this by checking out to the appropriate version using a Git command like `git checkout <desired version>`. Then, build the current version into container images: `make localnet-build`.

> **Caution**: Be aware that running E2E tests will take control of your localosmosis server. Ensure you have backups of any important data because it may be lost during the tests. For the tests to run properly, they require a fresh instance of your localosmosis server because they make assumptions about the account state.

4. **Modify the Path in start-osmosisd.sh**: You need to point to your Osmosis repository root. This step might look like updating a line in the `start-osmosisd.sh` file to something like `OSMOSIS_PATH="/path/to/your/osmosis/repo"`.

5. **Run the E2E Tests**: Finally, run the command `yarn test:e2e` to start the tests. The tests should take care of setting up any necessary state before running.

### Troubleshooting

- Account sequence mismatch errors: go to the sendTx function passed to `MockKeplrWithFee` in `test-env.ts` and increase the timeout to allow for more time for the transaction to be processed (depends on the Docker VM and the host machine). If that doesn't fix it, you likely have a promise somewhere around a send function that is not resolving and is causing a test case to timeout.

### Tips

Say you want to create add a new message to the frontend; the fastest approach is to:

1. Write the message in the account layer
2. Add any needed queries in the query layer
3. Add test cases, in a file that makes sense to categorize it in
4. To avoid waiting for all of the tests to run you can:
   - Isolate just the test file. Example: `yarn test:e2e positions`
   - Isolate further to just the test case, with a fuzzy search param: `yarn test:e2e positions -t "should fail"`

Writing e2e tests help identify gas amount errors and message encoding issues.
