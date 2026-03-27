# Hedged Fallback RPCs — Problem & Solution

## Problem

The Osmosis frontend's IBC bridge transfer flow was timing out when querying chains with dead primary RPC/REST endpoints (e.g. FIRMACHAIN). The root cause:

1. **Dead "black hole" endpoints** — The primary endpoints for some chains (like `rpc-explorer-mainnet.firmachain.dev`) accept TCP connections but never respond, silently burning the full timeout.

2. **Sequential retry strategy** — The original code tried endpoints one at a time with 3 retries × 5s timeout each. A single dead primary = ~15s wasted before trying the next endpoint — well past the 10s tRPC timeout on Vercel serverless functions.

3. **Single-endpoint usage everywhere** — `getTimeoutHeight`, `TxTracer`, `PollingStatusSubscription`, and the wallet store's `getTimeoutHeight` all used `rpc[0]` directly with no fallback. If the primary was dead, the entire flow failed.

4. **No cross-component knowledge sharing** — Even when one HTTP call discovered a working endpoint, that knowledge was lost. TxTracer (WebSocket) would independently try the same dead primary.

## Solution

A **hedged request** pattern with a **shared health cache**, implemented across 7 files in 4 packages.

### 1. Hedged Requests (replaces sequential retry)

`MultiEndpointClient.fetch()` and `createNodeQuery` now fire requests staggered 1 second apart using a `Promise.any`-style race. The first successful response wins; all other in-flight requests are immediately aborted via `AbortController`.

- **`hedgeDelay: 1000ms`** — next endpoint fires 1s after the previous, avoiding unnecessary load on healthy RPCs
- **`timeout: 3000ms`** — per-attempt cap
- **`maxTotalTime: 8000ms`** — hard wall-clock budget across all endpoints (fits within Vercel's 10s limit)
- **`AbortSignal.timeout()` with `AbortController` fallback** for older Node compatibility

Dead primary scenario: old = ~15s (sequential exhaustion), new = ~2.5s (hedge fires at t=1s, healthy endpoint responds at ~t=2.5s).

### 2. Endpoint Health Cache (`endpoint-health.ts`)

A module-level `Map<url, timestamp>` tracking which endpoints responded successfully in the last 5 minutes. Two exports:

- `recordEndpointSuccess(url)` — called automatically when any hedged HTTP fetch succeeds
- `sortEndpointsByHealth(endpoints)` — reorders a URL list to put recently-healthy endpoints first, preserving original order as tiebreaker

### 3. TxTracer Uses Known-Good Endpoint

Instead of hedging WebSocket connections (unnatural for long-lived connections), `TxTracer` calls `sortEndpointsByHealth(urls)` in its constructor. By the time a WebSocket is needed, earlier HTTP calls (`queryRPCStatus`, `getTimeoutHeight`) have already populated the health cache. TxTracer connects to the proven endpoint first, with sequential fallback to the full list.

### 4. Multi-Endpoint Wiring Throughout

- **`queryRPCStatus`** — accepts `{ rpcUrls: string[] }` and creates a `MultiEndpointClient` with hedged defaults
- **`getTimeoutHeight`** — passes all RPC endpoints from the chain registry, not just `rpc[0]`
- **`IbcTransferStatusProvider`** — `getChainRpcUrls()` returns all RPC URLs; both `TxTracer` and `PollingStatusSubscription` receive the full list
- **`stores/account/base.ts`** — wallet store's `getTimeoutHeight` uses multi-endpoint `queryRPCStatus`

## Files Changed

| Package | File | Change |
|---------|------|--------|
| `utils` | `endpoint-health.ts` | **New** — health cache |
| `utils` | `multi-endpoint-client.ts` | Rewritten — hedged `Promise.any` with stagger |
| `utils` | `index.ts` | Export health cache |
| `server` | `create-node-query.ts` | Rewritten — hedged stagger for REST endpoints |
| `server` | `cosmos/rpc-status.ts` | Updated params — `hedgeDelay` replaces `maxRetries` |
| `tx` | `tracer.ts` | Sort URLs by health on construction |
| `bridge` | `ibc/transfer-status.ts` | Pass all RPC URLs instead of `rpc[0]` |
| `stores` | `account/base.ts` | Multi-endpoint `queryRPCStatus` |

## Test Coverage

- 13 tests for `MultiEndpointClient` (hedging, health cache, abort signal, priority sorting)
- 11 tests for `createNodeQuery` (fallback, budget exhaustion, single endpoint, error messages)

All typecheck clean across `utils`, `server`, `tx`, `bridge`, and `stores` (one pre-existing unrelated type error in stores).

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| 1s hedge delay (not 500ms) | Avoids spamming healthy RPCs; typical Cosmos RPC response is 1–3s |
| 8s total budget (not 10s) | Leaves headroom within Vercel's 10s serverless timeout |
| Health cache over explicit propagation | Avoids threading "winning endpoint" through every call chain; works across server and client contexts independently |
| Sequential WebSocket fallback (not hedged) | WebSockets are long-lived; hedging them wastes connections. Health cache ensures TxTracer starts with the right endpoint |
| ES6-compatible `promiseAny` polyfill | Root tsconfig targets ES6; `Promise.any` requires ES2021 |

## Known Limitation

The wallet `signAndBroadcast()` path in `stores/account/base.ts` still gets a single RPC from `wallet.getRpcEndpoint()` for its `TxTracer`. This is controlled by the wallet provider (Keplr/cosmos-kit), not our endpoint selection — a different concern from the bridge flow fixed here.
