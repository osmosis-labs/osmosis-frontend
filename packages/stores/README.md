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

### Test

Will run a Docker container from [LocalOsmosis](https://github.com/osmosis-labs/LocalOsmosis) image (arch: M1 Pro).

```
yarn build && yarn test
```
