import type { ConcentratedPoolRawResponse, Pool } from "@osmosis-labs/server";

/**
 * Determines the state of a concentrated liquidity pool.
 * Centralizes pool state detection logic to ensure consistency across the app.
 *
 * @param pool - The pool to check (can be null/undefined)
 * @returns Object with isUninitialized and isInactive flags
 *
 * Pool states:
 * - Uninitialized: Pool has never been initialized (no price set, sqrt_price = 0)
 * - Inactive: Pool has been initialized but has no in-range liquidity (sqrt_price != 0, tick_liquidity = 0)
 * - Active: Pool has in-range liquidity (sqrt_price != 0, tick_liquidity != 0)
 *
 * Note: This detection does NOT rely on TVL because chain-fallback pools
 * (pools with unlisted assets) report TVL as 0 even when they have liquidity.
 * Instead, we use current_sqrt_price to determine if a pool has been initialized.
 */
export function getConcentratedPoolState(pool: Pool | null | undefined): {
  isUninitialized: boolean;
  isInactive: boolean;
} {
  if (!pool || pool.type !== "concentrated") {
    return { isUninitialized: false, isInactive: false };
  }

  const poolRaw = pool.raw as ConcentratedPoolRawResponse;
  const currentSqrtPrice = poolRaw?.current_sqrt_price;
  const currentTickLiquidity = poolRaw?.current_tick_liquidity;

  const isSqrtPriceZero = currentSqrtPrice
    ? parseFloat(currentSqrtPrice) === 0
    : true;
  const isTickLiquidityZero = currentTickLiquidity
    ? parseFloat(currentTickLiquidity) === 0
    : true;

  // Pool is uninitialized if it has no price set (sqrt_price = 0)
  // This implies the pool has never had liquidity added
  const isUninitialized = isSqrtPriceZero && isTickLiquidityZero;

  // Pool is inactive if it has a price set but no in-range liquidity
  // This happens when all liquidity positions are out of range
  // Note: We use !isSqrtPriceZero instead of hasTVL because chain-fallback pools
  // always report TVL as 0 even when they have out-of-range liquidity
  const isInactive = isTickLiquidityZero && !isSqrtPriceZero;

  return { isUninitialized, isInactive };
}
