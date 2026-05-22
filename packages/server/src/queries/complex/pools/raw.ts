import type {
  ConcentratedPoolRawResponse,
  StablePoolRawResponse,
  WeightedPoolRawResponse,
} from "../../osmosis/poolmanager/pools";
import type { Pool } from "./index";

/** Typed accessors over `Pool["raw"]`. The `raw` field is the discriminated
 *  union `PoolRawResponse` minus `@type`, but consumers normally only know
 *  `pool.type` (the friendly tag). These helpers narrow by `pool.type` so
 *  callers don't have to repeat the `as` shape gymnastics. */

export function getWeightedRaw(
  pool: Pool
): Omit<WeightedPoolRawResponse, "@type"> | undefined {
  return pool.type === "weighted"
    ? (pool.raw as Omit<WeightedPoolRawResponse, "@type">)
    : undefined;
}

export function getStableRaw(
  pool: Pool
): Omit<StablePoolRawResponse, "@type"> | undefined {
  return pool.type === "stable"
    ? (pool.raw as Omit<StablePoolRawResponse, "@type">)
    : undefined;
}

export function getConcentratedRaw(
  pool: Pool
): Omit<ConcentratedPoolRawResponse, "@type"> | undefined {
  return pool.type === "concentrated"
    ? (pool.raw as Omit<ConcentratedPoolRawResponse, "@type">)
    : undefined;
}

/** Returns the underlying denoms for a pool, narrowing by `pool.type` so the
 *  raw shape access stays in one place. Falls back to reserveCoins for
 *  CosmWasm-typed pools where the chain shape is contract-specific. */
export function getPoolRawDenoms(pool: Pool): string[] {
  const weighted = getWeightedRaw(pool);
  if (weighted) return weighted.pool_assets.map((a) => a.token.denom);
  const stable = getStableRaw(pool);
  if (stable) return stable.pool_liquidity.map((a) => a.denom);
  const concentrated = getConcentratedRaw(pool);
  if (concentrated) return [concentrated.token0, concentrated.token1];
  return pool.reserveCoins.map((c) => c.currency.coinMinimalDenom);
}
