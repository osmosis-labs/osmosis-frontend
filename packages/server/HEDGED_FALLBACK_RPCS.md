# Hedged Fallback RPCs — Problem & Solution

## Problem

The Osmosis frontend's IBC bridge transfer flow was timing out when querying chains with dead primary RPC/REST endpoints (e.g. FIRMACHAIN). The root cause:

1. **Dead "black hole" endpoints** — The primary endpoints for some chains (like `rpc-explorer-mainnet.firmachain.dev`) accept TCP connections but never respond, silently burning the full timeout.

2. **Sequential retry strategy** — The original code tried endpoints one at a time with 3 retries × 5s timeout each. A single dead primary = ~15s wasted before trying the next endpoint — well past the 10s tRPC timeout on Vercel serverless functions.

3. **Single-endpoint usage everywhere** — `getTimeoutHeight`, `TxTracer`, `PollingStatusSubscription`, and the wallet store's `getTimeoutHeight` all used `rpc[0]` directly with no fallback. If the primary was dead, the entire flow failed.

4. **TxTracer WebSocket stuck on dead endpoints** — WebSocket connections to dead endpoints hang for 30–60s each. With 3 reconnect attempts per endpoint, TxTracer could waste 3+ minutes before finding a working endpoint, causing "Withdrawal taking longer than expected" in the UI.

## Solution

A **hedged request** pattern for HTTP, with a **pre-probe** to guide WebSocket connections.

### 1. Hedged Requests (replaces sequential retry)

`MultiEndpointClient.fetch()` and `createNodeQuery` fire requests staggered 1 second apart using a `Promise.any`-style race. The first successful response wins; all other in-flight requests are immediately aborted via `AbortController`.

- **`hedgeDelay: 1000ms`** — next endpoint fires 1s after the previous, avoiding unnecessary load on healthy RPCs
- **`timeout: 3000ms`** — per-attempt cap
- **`maxTotalTime: 8000ms`** — hard wall-clock budget across all endpoints (fits within Vercel's 10s limit)
- **`AbortSignal.timeout()` with `AbortController` fallback** for older Node compatibility

Dead primary scenario: old = ~15s (sequential exhaustion), new = ~2.5s (hedge fires at t=1s, healthy endpoint responds at ~t=2.5s).

### 2. Pre-probe for TxTracer (replaces health cache)

Before creating a `TxTracer` WebSocket connection, `IbcTransferStatusProvider.traceStatus()` fires a fast hedged HTTP `/status` probe against the destination chain's RPCs. The winning endpoint is placed first in the URL list passed to TxTracer, so it connects to a known-good WebSocket immediately.

This replaces the previous global health cache approach (`endpoint-health.ts`), which couldn't cross the server/client process boundary — server-side hedged calls populated the cache on Vercel, but TxTracer ran in the browser with an empty cache.

### 3. Error Backoff for Status Polling

`PollingStatusSubscription` now waits one block-time interval (~7.5s) before retrying when a `/status` poll fails. Previously, failures triggered an immediate retry loop that spammed endpoints with hedged request batches.

### 4. Multi-Endpoint Wiring Throughout

- **`queryRPCStatus`** — accepts `{ rpcUrls: string[] }` and creates a `MultiEndpointClient` with hedged defaults
- **`getTimeoutHeight`** — passes all RPC endpoints from the chain registry, not just `rpc[0]`
- **`IbcTransferStatusProvider`** — `getChainRpcUrls()` returns all RPC URLs; both `TxTracer` and `PollingStatusSubscription` receive the full list
- **`stores/account/base.ts`** — wallet store's `getTimeoutHeight` uses multi-endpoint `queryRPCStatus`
- **`fetchWithEndpoint()`** — new method on `MultiEndpointClient` that returns both the data and the winning endpoint address, used by the pre-probe

## Files Changed

| Package  | File                       | Change                                                   |
| -------- | -------------------------- | -------------------------------------------------------- |
| `utils`  | `multi-endpoint-client.ts` | Hedged `Promise.any` with stagger; `fetchWithEndpoint()` |
| `server` | `create-node-query.ts`     | Hedged stagger for REST endpoints                        |
| `server` | `cosmos/rpc-status.ts`     | Updated params — `hedgeDelay` replaces `maxRetries`      |
| `tx`     | `tracer.ts`                | Multi-endpoint WebSocket with sequential failover        |
| `tx`     | `poll-status.ts`           | Error backoff delay                                      |
| `bridge` | `ibc/transfer-status.ts`   | Pre-probe + pass sorted URLs to TxTracer                 |
| `stores` | `account/base.ts`          | Multi-endpoint `queryRPCStatus`                          |

## Key Design Decisions

| Decision                                   | Rationale                                                                                                             |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| 1s hedge delay (not 500ms)                 | Avoids spamming healthy RPCs; typical Cosmos RPC response is 1–3s                                                     |
| 8s total budget (not 10s)                  | Leaves headroom within Vercel's 10s serverless timeout                                                                |
| Pre-probe over global cache                | Health cache can't cross server/client boundary; pre-probe is explicit and local                                      |
| Sequential WebSocket fallback (not hedged) | WebSockets are long-lived; hedging them wastes connections. Pre-probe ensures TxTracer starts with the right endpoint |
| ES6-compatible `promiseAny` polyfill       | Root tsconfig targets ES6; `Promise.any` requires ES2021                                                              |

## Known Limitation

The wallet `signAndBroadcast()` path in `stores/account/base.ts` still gets a single RPC from `wallet.getRpcEndpoint()` for its `TxTracer`. This is controlled by the wallet provider (Keplr/cosmos-kit), not our endpoint selection — a different concern from the bridge flow fixed here.
