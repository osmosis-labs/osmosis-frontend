/**
 * @file tx-confirm.ts
 * @description Proxy-safe transaction confirmation helpers for the E2E layer.
 *
 * Why this exists:
 * The in-app "Transaction Successful" toast is driven by the app's WebSocket
 * `TxTracer` (see packages/tx/src/tracer.ts). The EU/SG monitoring suites run
 * the browser through an HTTP CONNECT proxy, over which long-lived WebSockets
 * frequently stall or disconnect. When that happens the toast never renders
 * even though the transaction was broadcast and included on-chain — producing
 * false test failures.
 *
 * These helpers let a test confirm a transaction by polling the Osmosis LCD
 * REST API directly from the Node test process. That fetch does NOT go through
 * the browser proxy, so it is reliable regardless of WebSocket health.
 */

import { REST_ENDPOINT } from "./config";

/** Mintscan tx URL, matching the app's Osmosis `explorerUrlToTx` format. */
export function buildExplorerTxUrl(hash: string): string {
  return `https://www.mintscan.io/osmosis/txs/${hash.toUpperCase()}`;
}

export interface PollTxOptions {
  /** Overall budget in ms before giving up. */
  timeout?: number;
  /** Delay between polls in ms. */
  intervalMs?: number;
  /** Abort early (e.g. when the WebSocket toast already confirmed success). */
  signal?: AbortSignal;
}

/**
 * Poll `GET {REST_ENDPOINT}/cosmos/tx/v1beta1/txs/{hash}` until the tx is
 * indexed on-chain.
 *
 * Resolves with the `tx_response` when the tx is included with `code === 0`.
 * Rejects if the tx is included but failed (`code !== 0`), if the abort signal
 * fires, or if the timeout elapses before the tx is indexed.
 *
 * A not-yet-indexed tx returns 404/NotFound from the LCD; that is treated as
 * "keep polling", as are transient network errors.
 */
export async function pollTxOnChain(
  hash: string,
  { timeout = 40_000, intervalMs = 2_000, signal }: PollTxOptions = {}
): Promise<{ code: number; height?: string; raw_log?: string }> {
  const url = `${REST_ENDPOINT.replace(/\/+$/, "")}/cosmos/tx/v1beta1/txs/${hash}`;
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    if (signal?.aborted) {
      throw new Error("pollTxOnChain aborted");
    }

    // WHATWG fetch has no default timeout, so a single hung request could
    // block past `deadline` and never reach the throw below. Bound each attempt
    // (capped at 10s, never beyond the remaining budget) with an
    // AbortController, and also abort it if the caller's signal fires (e.g. the
    // WS toast already confirmed success).
    const attemptController = new AbortController();
    const onCallerAbort = () => attemptController.abort();
    const attemptMs = Math.max(0, Math.min(deadline - Date.now(), 10_000));
    const attemptTimer = setTimeout(() => attemptController.abort(), attemptMs);
    signal?.addEventListener("abort", onCallerAbort, { once: true });

    try {
      const res = await fetch(url, { signal: attemptController.signal });
      if (res.ok) {
        const json = (await res.json()) as {
          tx_response?: { code?: number; height?: string; raw_log?: string };
        };
        const txResponse = json?.tx_response;
        if (txResponse && typeof txResponse.code === "number") {
          if (txResponse.code === 0) {
            return {
              code: 0,
              height: txResponse.height,
              raw_log: txResponse.raw_log,
            };
          }
          throw new Error(
            `tx ${hash} failed on-chain (code ${txResponse.code}): ${
              txResponse.raw_log ?? "no log"
            }`
          );
        }
      }
      // 404 / not indexed yet — keep polling until the deadline.
    } catch (err) {
      // Re-throw a genuine on-chain failure or a caller abort; swallow network
      // blips and per-attempt timeouts (the loop re-checks the deadline next).
      if (signal?.aborted) throw err;
      if (err instanceof Error && err.message.startsWith(`tx ${hash} failed`)) {
        throw err;
      }
      // transient fetch error / per-attempt timeout — keep polling
    } finally {
      clearTimeout(attemptTimer);
      signal?.removeEventListener("abort", onCallerAbort);
    }

    // Cap the inter-poll sleep to the remaining budget so we don't overshoot
    // the deadline by up to `intervalMs` on the final iteration.
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(intervalMs, remaining))
    );
  }

  throw new Error(`tx ${hash} not confirmed on-chain within ${timeout}ms`);
}
