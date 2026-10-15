import { apiClient } from "@osmosis-labs/utils";

import { SIDECAR_BASE_URL } from "../../env";

/**
 * The quote denom the app expects sidecar prices in: Alloyed USDC.
 *
 * Sidecar does not hardcode its quote denom; it resolves the human symbol
 * "usdc" against the assetlist once at boot. Since the assetlist identity
 * handover that symbol resolves to the alloy, so a sidecar instance quotes in
 * the alloy from its next restart onward and in Noble USDC until then. The two
 * deployments therefore cannot be assumed to flip together, and the lookup
 * below accepts either key so price reads keep working on both sides of the
 * sidecar restart.
 */
export const QUOTE_COIN_MINIMAL_DENOM =
  "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC";

/**
 * The quote denom sidecar returned before the identity handover (Noble USDC).
 * Transitional: remove this constant and the fallback in `getQuotePrice` once
 * every production sidecar instance is confirmed quoting in the alloy.
 */
export const LEGACY_QUOTE_COIN_MINIMAL_DENOM =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";

/**
 * Reads a base asset's quote price out of a sidecar price map, preferring the
 * current quote denom and falling back to the legacy one. Returns undefined
 * when neither key is present; callers must treat that as "no price", never
 * as zero.
 */
export function getQuotePrice(
  quotes: Record<string, string> | undefined
): string | undefined {
  if (!quotes) return undefined;
  return (
    quotes[QUOTE_COIN_MINIMAL_DENOM] ?? quotes[LEGACY_QUOTE_COIN_MINIMAL_DENOM]
  );
}

export type PriceMap = {
  /** Inner map is keyed by the quote denom the responding sidecar instance
   *  uses (see `getQuotePrice`). */
  [baseCoinMinimalDenom: string]: Record<string, string>;
};

// Shared by all callers in this Edge isolate, independently of DataLoader caches.
let activePriceRequests = 0;
const priceRequestQueue: (() => void)[] = [];

export async function queryPrices(coinMinimalDenoms: string[]) {
  const queuedAt = Date.now();
  if (activePriceRequests >= 2) {
    await new Promise<void>((resolve) => priceRequestQueue.push(resolve));
  } else {
    activePriceRequests++;
  }

  try {
    // Do not start stale queued work after the tRPC procedure's 12s deadline.
    if (Date.now() - queuedAt >= 10_000) {
      throw new Error("SQS price request expired in queue");
    }
    return await fetchPrices(coinMinimalDenoms);
  } finally {
    const next = priceRequestQueue.shift();
    if (next)
      next(); // Transfer this slot directly to the oldest waiter.
    else activePriceRequests--;
  }
}

async function fetchPrices(coinMinimalDenoms: string[]) {
  const url = new URL("/tokens/prices", SIDECAR_BASE_URL);

  url.searchParams.append("base", coinMinimalDenoms.join(","));

  return await apiClient<PriceMap>(url.toString());
}
