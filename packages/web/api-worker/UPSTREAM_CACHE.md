# Upstream cache inventory

Calls reachable from the API Worker handlers (`server/api-handlers`, the tRPC routers, `@osmosis-labs/server`, and `@osmosis-labs/bridge`). Unless noted, the call goes through `apiClient` (`packages/utils/src/api-client.ts`), which sends GET unless `data` is set, in which case it sends POST with a JSON body.

Class is `public` (same body for every user), `user` (an address, account, tx hash, balance, or position is in the URL or body), or `effect` (broadcast, simulate, or an RPC proxy). Anything uncertain is not cached.

The shared cache allowlist is the table under [Allowlist](#allowlist). LCD and RPC are not on it: hosts come from the chain registry, and a few of those paths are per user. Caching a registry host would either miss the real endpoint or store the wrong class of response.

In-memory TTLs are the `cachified` values in front of the call today. `SWR` is stale-while-revalidate on top of that TTL. The upstream cache does not serve stale.

## Counts

| Class  | Calls |
| ------ | ----: |
| public |    49 |
| user   |    35 |
| effect |     6 |

17 of the public calls are covered by the 16 allowlist rules (`github-raw-content` covers asset lists and fe-content). The other 32 public calls are [candidates](#candidates) left out on purpose. The lockup row below is three calls (locked, longer-duration, unlocking).

## Allowlist

TTL is the fallback when the upstream sends no `s-maxage` or `max-age`. The stored entry never exceeds the max. An upstream lifetime shorter than the max is kept. `private`, `no-store`, and `no-cache` are not stored. Non-2xx responses are not stored.

| id                         | hosts                                                                | path                                                                        | default                         | max  | why this TTL                                                            |
| -------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------- | ---- | ----------------------------------------------------------------------- |
| `sqs-pools`                | `sqs.osmosis.zone`, `sqsprod.osmosis.zone`                           | `/pools`                                                                    | 5s                              | 5s   | in-memory pool list is 5s                                               |
| `sqs-prices`               | `sqs.osmosis.zone`, `sqsprod.osmosis.zone`                           | `/tokens/prices`                                                            | 10s                             | 10s  | asset price cache is 10s                                                |
| `sqs-canonical-orderbooks` | `sqs.osmosis.zone`, `sqsprod.osmosis.zone`                           | `/pools/canonical-orderbooks`                                               | 15s                             | 15s  | forced-fresh orderbook read is 15s                                      |
| `numia-pools-apr`          | `data.app.osmosis.zone`, `data.stage.osmosis.zone`                   | `/pools_apr`                                                                | 30s                             | 30s  | in-memory APR map is 30s                                                |
| `numia-pools-apr-range`    | `data.app.osmosis.zone`, `data.stage.osmosis.zone`                   | `/pools_apr_range`                                                          | 30s                             | 30s  | in-memory incentives map is 30s                                         |
| `numia-staking-apr`        | `data.app.osmosis.zone`, `data.stage.osmosis.zone`                   | `/apr`                                                                      | 30m                             | 30m  | staking APR cache is 30 minutes                                         |
| `numia-token-data`         | `data.app.osmosis.zone`, `data.stage.osmosis.zone`                   | `/tokens/v2/all`                                                            | 30s                             | 30s  | body includes prices; cap is 30s                                        |
| `numia-token-chart`        | `data.app.osmosis.zone`, `data.stage.osmosis.zone`                   | `/tokens/v2/historical/:denom/chart`                                        | 3s if `realtime=true`, else 30s | same | realtime in-memory TTL is 3s; other charts are price-capped at 30s      |
| `numia-pair-chart`         | `data.app.osmosis.zone`, `data.stage.osmosis.zone`                   | `/pairs/v1/historical/:poolId/chart`                                        | 30s                             | 30s  | in-memory pair chart is 3 minutes; price cap is 30s                     |
| `numia-range-apr`          | `data.app.osmosis.zone`, `data.stage.osmosis.zone`                   | `/cl/v1/apr/rewards/:poolId`                                                | 30s                             | 30s  | concentrated range APR cache is 30s                                     |
| `coingecko-simple-price`   | `prices.osmosis.zone`, `coingecko.osmosis.zone`, `api.coingecko.com` | `/api/v3/simple/price`                                                      | 30s                             | 30s  | in-memory price is 60s; price cap is 30s                                |
| `coingecko-coin-list`      | `prices.osmosis.zone`, `coingecko.osmosis.zone`, `api.coingecko.com` | `/api/v3/coins/list`                                                        | 1h                              | 1h   | active CoinGecko id set is cached for 1 hour                            |
| `coingecko-coin`           | `prices.osmosis.zone`, `coingecko.osmosis.zone`, `api.coingecko.com` | `/api/v3/coins/:id` (not `list`)                                            | 30s                             | 30s  | payload includes market prices                                          |
| `coingecko-market-chart`   | `prices.osmosis.zone`, `coingecko.osmosis.zone`, `api.coingecko.com` | `/api/v3/coins/:id/market_chart/range`                                      | 10s                             | 10s  | in-memory market chart is 10s                                           |
| `github-raw-content`       | `raw.githubusercontent.com`                                          | `/osmosis-labs/assetlists/:ref/...` and `/osmosis-labs/fe-content/:ref/...` | 5m                              | 5m   | CMS files on `main` can change; upcoming-assets memory TTL is 5 minutes |
| `keybase-lookup`           | `keybase.io`                                                         | `/_/api/1.0/user/lookup.json`                                               | 5m                              | 5m   | validator record cache is 5 minutes                                     |

Numia `Authorization: Bearer` and CoinGecko `X-API-KEY` are server credentials. They are sent on the upstream request, omitted from the cache key, and stripped if an upstream echoes them. `Set-Cookie` is stripped from the stored response.

`data.app.osmosis.zone` is `NEXT_PUBLIC_HISTORICAL_DATA_URL` in `packages/web/.env`. `data.stage.osmosis.zone` is the code default. `sqsprod.osmosis.zone` is the app-only production sidecar named in the API Worker README. `sqs.osmosis.zone` is the code default.

## Sidecar (SQS)

Host from `SIDECAR_BASE_URL` (`NEXT_PUBLIC_SIDECAR_BASE_URL`, default `https://sqs.osmosis.zone/`). No auth header.

| Call                                 | Path                                          | Method | Memory TTL        | Class  |
| ------------------------------------ | --------------------------------------------- | ------ | ----------------- | ------ |
| `queryPools`                         | `/pools`                                      | GET    | 5s                | public |
| `queryPrices`                        | `/tokens/prices`                              | GET    | 10s (asset price) | public |
| `queryCanonicalOrderbooks`           | `/pools/canonical-orderbooks`                 | GET    | 15s forced / 1h   | public |
| `routeByTokenIn` / `routeByTokenOut` | `/router/quote`                               | GET    | none at the query | public |
| same, with `poolID`                  | `/router/custom-direct-quote`                 | GET    | none at the query | public |
| `queryActiveOrdersSQS`               | `/passthrough/active-orders?userOsmoAddress=` | GET    | 5s and 10s        | user   |
| `queryPortfolioAssets`               | `/passthrough/portfolio-assets/:address`      | GET    | none              | user   |

## Numia (data services)

Host from `HISTORICAL_DATA_URL` (`NEXT_PUBLIC_HISTORICAL_DATA_URL`, default `https://data.stage.osmosis.zone`). This checkout's env uses `https://data.app.osmosis.zone`.

| Call                            | Path                                          | Method | Auth                          | Memory TTL                 | Class  |
| ------------------------------- | --------------------------------------------- | ------ | ----------------------------- | -------------------------- | ------ |
| `queryPoolAprs`                 | `/pools_apr`                                  | GET    | none                          | 30s + SWR to 24h           | public |
| `queryPoolAprsRange`            | `/pools_apr_range`                            | GET    | none                          | 30s + SWR to 24h           | public |
| `queryStakingApr`               | `/apr`                                        | GET    | `Authorization: Bearer` Numia | 30m + SWR to 24h           | public |
| `queryAllTokenData`             | `/tokens/v2/all`                              | GET    | none                          | 5m freshness, cachified 1h | public |
| `queryTokenHistoricalChart`     | `/tokens/v2/historical/:denom/chart`          | GET    | none                          | 3s realtime, else 3m       | public |
| `queryTokenPairHistoricalChart` | `/pairs/v1/historical/:poolId/chart`          | GET    | none                          | 3m                         | public |
| `queryPriceRangeApr`            | `/cl/v1/apr/rewards/:poolId`                  | GET    | none                          | 30s + SWR to 24h           | public |
| `queryTransactions`             | `/v2/txs/:address`                            | GET    | `Authorization: Bearer` Numia | 15s                        | user   |
| `queryPortfolioOverTime`        | `/users/portfolio/over_time`                  | GET    | `Authorization: Bearer` Numia | 60s                        | user   |
| `queryHistoricalOrders`         | `/users/limit_orders/history/closed?address=` | GET    | none                          | 5s                         | user   |
| `queryPositionPerformance`      | `/cl/v1/position/last/id/:positionId`         | GET    | none                          | none                       | user   |

## CoinGecko

`PRICES_API_URL` is `https://prices.osmosis.zone` when `COINGECKO_API_KEY` is set, otherwise `https://api.coingecko.com/api/v3`. `DETAILS_API_URL` is `https://coingecko.osmosis.zone` with the key, otherwise the same public host. The key is sent as `X-API-KEY`.

| Call                    | Path                                   | Method | Memory TTL                                      | Class  |
| ----------------------- | -------------------------------------- | ------ | ----------------------------------------------- | ------ |
| `querySimplePrice`      | `/api/v3/simple/price`                 | GET    | 60s per id; the batch loader object is kept 10m | public |
| `queryCoingeckoCoinIds` | `/api/v3/coins/list`                   | GET    | 1h                                              | public |
| `queryCoingeckoCoin`    | `/api/v3/coins/:id`                    | GET    | 30m                                             | public |
| `queryMarketChart`      | `/api/v3/coins/:id/market_chart/range` | GET    | 10s                                             | public |

## GitHub and Keybase

| Call                                                                    | Host and path                                                | Method | Auth                                    | Memory TTL                                     | Class  |
| ----------------------------------------------------------------------- | ------------------------------------------------------------ | ------ | --------------------------------------- | ---------------------------------------------- | ------ |
| `queryGithubFile` (asset lists, chain list, token CMS, upcoming assets) | `raw.githubusercontent.com/osmosis-labs/assetlists/:ref/...` | GET    | none                                    | chains 1 day in bridge gas; upcoming assets 5m | public |
| `queryOsmosisCMS` (app store, swap banners, and other fe-content files) | `raw.githubusercontent.com/osmosis-labs/fe-content/:ref/...` | GET    | none                                    | none at the query                              | public |
| `queryLatestCommitHash`                                                 | `api.github.com/repos/:repo/commits/:branch`                 | GET    | `Authorization: Bearer` GitHub when set | none                                           | public |
| `queryValidatorThumbnail`                                               | `keybase.io/_/api/1.0/user/lookup.json`                      | GET    | none                                    | 5m (validator)                                 | public |

`queryLatestCommitHash` is only called from `config/generate-lists.ts` (build time), not from a request handler. It is not allowlisted.

## Chain LCD

Host is each chain's `apis.rest` entry (Osmosis production includes `lcd.app.osmosis.zone`). `createNodeQuery` races those endpoints. No auth header. All of these are GET. None are allowlisted.

| Call                                             | Path                                                                         | Memory TTL                                   | Class  |
| ------------------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------- | ------ |
| mint inflation                                   | `/cosmos/mint/v1beta1/inflation`                                             | none                                         | public |
| bank supply                                      | `/cosmos/bank/v1beta1/supply/by_denom`                                       | none                                         | public |
| distribution params                              | `/cosmos/distribution/v1beta1/params`                                        | none                                         | public |
| staking pool                                     | `/cosmos/staking/v1beta1/pool`                                               | none                                         | public |
| staking validators                               | `/cosmos/staking/v1beta1/validators`                                         | 5m (validator list)                          | public |
| staking params                                   | `/cosmos/staking/v1beta1/params`                                             | none                                         | public |
| epoch provisions                                 | `/osmosis/mint/v1beta1/epoch_provisions`                                     | none                                         | public |
| mint params                                      | `/osmosis/mint/v1beta1/params`                                               | none                                         | public |
| gauges                                           | `/osmosis/incentives/v1beta1/gauges`                                         | 10m                                          | public |
| pool gauge ids                                   | `/osmosis/pool-incentives/v1beta1/gauge-ids/:poolId`                         | 10m                                          | public |
| incentivized pools                               | `/osmosis/pool-incentives/v1beta1/incentivized_pools`                        | 10m                                          | public |
| superfluid asset multiplier                      | `/osmosis/superfluid/v1beta1/asset_multiplier`                               | 5m                                           | public |
| all superfluid assets                            | `/osmosis/superfluid/v1beta1/all_assets`                                     | 5m                                           | public |
| superfluid params                                | `/osmosis/superfluid/v1beta1/params`                                         | none                                         | public |
| epochs                                           | `/osmosis/epochs/v1beta1/epochs`                                             | 3m                                           | public |
| fee tokens                                       | `/osmosis/txfees/v1beta1/fee_tokens`                                         | none                                         | public |
| EIP base fee                                     | `/osmosis/txfees/v1beta1/cur_eip_base_fee`                                   | none                                         | public |
| fee token spot price                             | `/osmosis/txfees/v1beta1/spot_price_by_denom`                                | none                                         | public |
| txfees base denom                                | `/osmosis/txfees/v1beta1/base_denom`                                         | none                                         | public |
| num pools                                        | `/osmosis/poolmanager/v1beta1/num_pools`                                     | none                                         | public |
| pool by id                                       | `/osmosis/poolmanager/v1beta1/pools/:poolId`                                 | none                                         | public |
| CL liquidity per tick                            | `/osmosis/concentratedliquidity/v1beta1/liquidity_per_tick_range`            | 5s (tick state)                              | public |
| CL params                                        | `/osmosis/concentratedliquidity/v1beta1/params`                              | none                                         | public |
| account                                          | `/cosmos/auth/v1beta1/accounts/:address`                                     | none                                         | user   |
| balances                                         | `/cosmos/bank/v1beta1/balances/:address`                                     | none                                         | user   |
| delegator rewards                                | `/cosmos/distribution/v1beta1/delegators/:address/rewards`                   | none                                         | user   |
| tx by hash                                       | `/cosmos/tx/v1beta1/txs/:txHash`                                             | none                                         | user   |
| undelegations                                    | `/cosmos/staking/v1beta1/delegators/:address/unbonding_delegations`          | none                                         | user   |
| delegator validators                             | `/cosmos/staking/v1beta1/delegators/:address/validators`                     | none                                         | user   |
| delegations                                      | `/cosmos/staking/v1beta1/delegations/:address`                               | none                                         | user   |
| authenticators                                   | `/osmosis/smartaccount/authenticators/:address`                              | none                                         | user   |
| superfluid undelegations by delegator            | `/osmosis/superfluid/v1beta1/superfluid_undelegations_by_delegator/:address` | none                                         | user   |
| account delegated CL positions                   | `/osmosis/superfluid/v1beta1/account_delegated_cl_positions/:address`        | 5s                                           | user   |
| superfluid delegations                           | `/osmosis/superfluid/v1beta1/superfluid_delegations/:address`                | none                                         | user   |
| account undelegating CL positions                | `/osmosis/superfluid/v1beta1/account_undelegating_cl_positions/:address`     | 5s                                           | user   |
| validator preferences                            | `/osmosis/valset-pref/v1beta1/:address`                                      | none                                         | user   |
| CL positions                                     | `/osmosis/concentratedliquidity/v1beta1/positions/:address`                  | none                                         | user   |
| CL unbonding positions                           | `/osmosis/concentratedliquidity/v1beta1/user_unbonding_positions/:address`   | 5s                                           | user   |
| CL position by id                                | `/osmosis/concentratedliquidity/v1beta1/position_by_id`                      | none                                         | user   |
| locked coins / longer duration / unlocking coins | `/osmosis/lockup/v1beta1/account_*:address`                                  | none                                         | user   |
| synthetic lockups                                | `/osmosis/lockup/v1beta1/synthetic_lockups_by_lock_id/:lockId`               | none                                         | user   |
| wasm smart query (transmuter, orderbook, ICNS)   | `/cosmwasm/wasm/v1/contract/:address/smart/:msg`                             | orderbook state 3s–4h depending on the query | user   |

The wasm smart-query message is an arbitrary contract query. Orderbook state is often shared, and ICNS or an order can be per user. The whole path stays uncached.

Skip also reads a counterparty LCD balance while building a quote: `GET {rest}/cosmos/bank/v1beta1/balances/:address`. That is `user`.

## RPC, broadcast, and other hosts

| Call                                      | Host and path                                                                  | Method | Auth                                    | Memory TTL         | Class  |
| ----------------------------------------- | ------------------------------------------------------------------------------ | ------ | --------------------------------------- | ------------------ | ------ |
| `sendTxSimulate`                          | chain LCD `/cosmos/tx/v1beta1/simulate`                                        | POST   | none                                    | none               | effect |
| broadcast handler                         | `{rest}/cosmos/tx/v1beta1/txs` via raw `fetch`                                 | POST   | none                                    | none               | effect |
| `queryDenomAuthorityMetadata`             | chain RPC `/abci_query` via raw `fetch`                                        | GET    | none                                    | none               | public |
| `queryRPCStatus`                          | chain RPC `/status`                                                            | GET    | none                                    | none               | public |
| EVM balances (`viem` `http()`)            | `EVM_RPC_URL_<chainId>` or the chain's public RPC                              | POST   | provider key in the URL when configured | none               | effect |
| `/api/evm-rpc`                            | those same EVM URLs, raw `fetch`                                               | POST   | same                                    | none               | effect |
| `/api/solana-rpc` and bridge Solana reads | `SOLANA_RPC_URL` or `api.mainnet-beta.solana.com`                              | POST   | provider key in the URL when configured | none               | effect |
| Skip `assets`                             | `api.skip.money/v2/fungible/assets`                                            | GET    | `Authorization` Skip key                | 30m                | public |
| Skip `chains`                             | `api.skip.money/v2/info/chains`                                                | GET    | Skip key                                | 30m                | public |
| Skip `route`                              | `api.skip.money/v2/fungible/route`                                             | POST   | Skip key                                | 20s quote          | user   |
| Skip `messages`                           | `api.skip.money/v2/fungible/msgs`                                              | POST   | Skip key                                | none               | user   |
| Skip `trackTransaction`                   | `api.skip.money/v2/tx/track`                                                   | POST   | Skip key                                | none               | effect |
| Skip `transactionStatus`                  | `api.skip.money/v2/tx/status`                                                  | GET    | Skip key                                | none               | user   |
| Squid route                               | `v2.api.squidrouter.com/v2/route` (testnet host when selected)                 | POST   | `x-integrator-id`                       | 20s quote          | user   |
| Squid chains / tokens                     | `/v2/chains`, `/v2/tokens`                                                     | GET    | `x-integrator-id`                       | 30m                | public |
| Squid status                              | `/v2/status`                                                                   | GET    | integrator id                           | none               | user   |
| Int3face transfer                         | `cachehub.int3face.zone/v2/transfers/:transferId` (testnet host when selected) | GET    | none                                    | none               | user   |
| Axelar GMP search                         | `api.axelarscan.io/gmp/searchGMP` (testnet host when selected), raw `fetch`    | POST   | none                                    | per-tx process map | user   |

Nitro and Nomic only build external URLs. They do not fetch those hosts.

## Candidates

Left off the allowlist. Each one is either per-user, an RPC/LCD host, price-sensitive at a cardinality that will not hit, or a 200 that the caller already refuses to keep.

- **SQS quotes** (`/router/quote`, `/router/custom-direct-quote`). Public for a given amount, and price-like. Amounts rarely repeat across users, so a shared entry would cost memory without much hit rate.
- **Skip assets and chains, Squid chains and tokens.** Public registries, but `cachified` rejects an empty 200 (a rate-limited or degraded body). A shared Cache API entry of that 200 would pin it for every isolate. The in-memory check would still fail, then refetch, then store the bad body again.
- **Public LCD and RPC** (pool by id, params, gauges, epochs, mint, staking validators, supply, superfluid assets, fee tokens, EIP base fee, spot price, num pools, tick liquidity, ABCI denom admin, RPC status). Same answer for every user. Hosts are whatever the chain registry lists, including endpoints that also serve balances. The spot price and EIP base fee are also price-like.
- **Wasm smart queries.** The path cannot be split into "shared orderbook state" and "user order" without reading the contract message.
- **`api.github.com` commit lookup.** Build-time only.
- **Numia paths that take an address or position id, SQS active orders and portfolio assets, Skip and Squid status, Int3face transfers, Axelar GMP search.** Classed `user` above. Not candidates for a shared cache.
