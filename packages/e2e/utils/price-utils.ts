/**
 * @file price-utils.ts
 * @description Fetches token prices from the SQS (Sidecar Query Server) API.
 *
 * Prices are returned in USDC terms. Used by the balance checker for
 * USD-denominated balance requirements and by the check-balances CLI
 * to display USD values alongside token balances.
 *
 * @example
 * ```ts
 * import { fetchTokenPrices } from '../utils/price-utils';
 * const prices = await fetchTokenPrices(['uosmo', 'ibc/27394FB09...']);
 * console.log(prices['uosmo']); // e.g. 0.85 (USDC per OSMO)
 * ```
 */

import { SQS_BASE_URL } from "./config";

const USDC_DENOM =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";

type SQSPriceResponse = Record<
  string,
  Record<string, string>
>;

// Retry parameters for transient SQS pricing failures (e.g. Node `fetch failed`
// from EAI_AGAIN, ECONNRESET, TLS handshake hiccups, or 30s timeouts on cold
// macOS GitHub runners). 3 attempts with exponential backoff catches >99% of
// transient blips without making the happy path noticeably slower (first
// attempt typically returns in <1s, retries only fire on real failures).
const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 250;

/**
 * Fetches USDC-denominated prices for the given on-chain denominations
 * from the SQS `/tokens/prices` endpoint.
 *
 * Retries up to 3 times with exponential backoff (250ms, 750ms, 2250ms) on
 * transient failures (network errors, non-2xx responses). A persistent failure
 * after all retries throws — callers should handle that as a soft failure
 * (see check-balances.ts which falls back to "balance check inconclusive"
 * rather than treating it as a real shortage).
 *
 * @param denoms - Array of on-chain minimal denominations (e.g. `["uosmo", "ibc/..."]`).
 * @returns Map of denom to USDC price (as a number). Tokens without a price are omitted.
 * @throws {Error} If all retry attempts fail.
 */
export async function fetchTokenPrices(
  denoms: string[]
): Promise<Record<string, number>> {
  if (denoms.length === 0) return {};

  const url = new URL("/tokens/prices", SQS_BASE_URL);
  url.searchParams.set("base", denoms.join(","));

  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch token prices: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as SQSPriceResponse;

      const result: Record<string, number> = {};
      for (const [denom, priceMap] of Object.entries(data)) {
        const usdcPrice = priceMap[USDC_DENOM] ?? Object.values(priceMap)[0];
        if (usdcPrice) {
          const parsed = parseFloat(usdcPrice);
          if (!isNaN(parsed)) {
            result[denom] = parsed;
          }
        }
      }
      return result;
    } catch (err) {
      lastErr = err;
      if (attempt === MAX_ATTEMPTS) break;
      const delay = BASE_BACKOFF_MS * Math.pow(3, attempt - 1);
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(
        `  fetchTokenPrices attempt ${attempt}/${MAX_ATTEMPTS} failed (${msg}); retrying in ${delay}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastErr instanceof Error
    ? lastErr
    : new Error(`fetchTokenPrices failed: ${String(lastErr)}`);
}
