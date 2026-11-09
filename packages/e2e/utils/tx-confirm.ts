/**
 * @file tx-confirm.ts
 * @description Transaction confirmation helpers for the E2E layer.
 *
 * Why this exists:
 * The in-app "Transaction Successful" toast is driven by the app's WebSocket
 * `TxTracer` (see packages/tx/src/tracer.ts). That WebSocket can stall or
 * disconnect, so the toast never renders even though the transaction was
 * broadcast and included on-chain — producing false test failures.
 *
 * These helpers let a test confirm a transaction by polling the Osmosis LCD
 * REST API directly from the Node test process, which does not depend on the
 * browser WebSocket.
 */

import { REST_ENDPOINT } from "./config";

/** Mintscan tx URL, matching the app's Osmosis `explorerUrlToTx` format. */
export function buildExplorerTxUrl(hash: string): string {
  return `https://www.mintscan.io/osmosis/txs/${hash.toUpperCase()}`;
}

export interface PollTxOptions {
  /** Overall budget in ms before giving up. */
  timeout?: number;
  /** Delay between polls in ms. Blocks are under a second apart. */
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
  { timeout = 40_000, intervalMs = 300, signal }: PollTxOptions = {}
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

/**
 * How long to wait before re-signing after a sequence mismatch: a few blocks,
 * so the node reports the sequence the other signer's tx moved it to.
 */
export const SEQUENCE_RETRY_DELAY_MS = 6_000;

/**
 * True for a CheckTx rejection caused by another tx from the same account
 * landing between signing and broadcast. The shared CI wallet makes this
 * likely whenever runs on different branches overlap.
 */
export function isSequenceMismatch(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("account sequence mismatch");
}

/**
 * How much of `denom` a confirmed tx paid to `address`, as a display amount
 * floored to 6 decimals (the precision the trade input accepts).
 *
 * Swap tests send back what the outbound leg received, so the shared wallet's
 * balances don't drift run after run. For tokens with more than six decimals,
 * up to 0.000001 stays behind. Reading the amount from the tx's own
 * `coin_received` and `coin_spent` events, rather than from a balance delta,
 * keeps it exact while other runs trade from the same wallet.
 */
export async function getTxReceivedAmount(
  txUrlOrHash: string | null,
  address: string,
  denom: string,
  decimals: number,
  timeout = 20_000
): Promise<string> {
  // Accepts the explorer link from the success toast, which ends in the hash.
  const hash = /[0-9a-f]{64}/i.exec(txUrlOrHash ?? "")?.[0]?.toLowerCase();
  if (!hash) throw new Error(`No tx hash in "${txUrlOrHash}"`);
  const url = `${REST_ENDPOINT.replace(/\/+$/, "")}/cosmos/tx/v1beta1/txs/${hash}`;
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) }).catch(
      () => undefined
    );
    if (res?.ok) {
      const json = (await res.json()) as {
        tx_response?: {
          events?: {
            type: string;
            attributes: { key: string; value: string }[];
          }[];
        };
      };
      // Net of what the wallet spent of the same denom, so a route that passes
      // the token through the wallet mid-route isn't counted twice.
      let received = BigInt(0);
      for (const event of json.tx_response?.events ?? []) {
        const attr = (key: string) =>
          event.attributes.find((a) => a.key === key)?.value ?? "";
        const sign =
          event.type === "coin_received" && attr("receiver") === address
            ? BigInt(1)
            : event.type === "coin_spent" && attr("spender") === address
              ? BigInt(-1)
              : BigInt(0);
        if (sign === BigInt(0)) continue;
        for (const coin of attr("amount").split(",")) {
          const match = /^(\d+)(.+)$/.exec(coin.trim());
          if (match?.[2] === denom) received += sign * BigInt(match[1]);
        }
      }
      if (received <= BigInt(0)) {
        throw new Error(`tx ${hash} paid no ${denom} to ${address}`);
      }
      // Floor to 6 decimals so the return leg never asks for more than arrived.
      const pow10 = (n: number) => BigInt(`1${"0".repeat(n)}`);
      const micro =
        decimals >= 6
          ? received / pow10(decimals - 6)
          : received * pow10(6 - decimals);
      if (micro === BigInt(0)) {
        throw new Error(`tx ${hash} paid less than 0.000001 of ${denom}`);
      }
      const whole = micro / BigInt(1_000_000);
      const fraction = (micro % BigInt(1_000_000)).toString().padStart(6, "0");
      return `${whole}.${fraction}`.replace(/\.?0+$/, "");
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(
    `tx ${hash} not found on ${REST_ENDPOINT} within ${timeout}ms`
  );
}
