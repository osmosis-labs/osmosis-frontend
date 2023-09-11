import { CoinPrimitive } from "@keplr-wallet/stores";
import { Dec, DecUtils } from "@keplr-wallet/unit";

import { PoolMetricsRaw, PoolRaw } from "../../queries/pools";
import { FilteredPools, PoolToken } from "./types";

export function makePoolRawFromFilteredPool(
  filteredPool: FilteredPools["pools"][0]
): { poolRaw: PoolRaw; poolMetrics?: PoolMetricsRaw } | undefined {
  // deny pools containing tokens with gamm denoms
  if (
    Array.isArray(filteredPool.pool_tokens) &&
    filteredPool.pool_tokens.some((token) => token.denom.includes("gamm"))
  ) {
    return;
  }

  // incorporate any pool metric data that's available
  const poolMetrics: PoolMetricsRaw = {};
  if (filteredPool.volume_24h) {
    poolMetrics.volume24hUsd = filteredPool.volume_24h;
  }
  if (filteredPool.volume_24h_change) {
    poolMetrics.volume24hUsdChange = filteredPool.volume_24h_change;
  }
  if (filteredPool.volume_7d) {
    poolMetrics.volume7dUsd = filteredPool.volume_7d;
  }
  if (filteredPool.liquidity) {
    poolMetrics.liquidityUsd = filteredPool.liquidity;
  }
  if (filteredPool.liquidity_24h_change) {
    poolMetrics.liquidity24hUsdChange = filteredPool.liquidity_24h_change;
  }

  if (
    filteredPool.type === "osmosis.concentratedliquidity.v1beta1.Pool" &&
    !Array.isArray(filteredPool.pool_tokens)
  ) {
    // concentrated pools don't use an array for pool tokens, rather asset0 and asset1
    // also, the amounts include decimals and need to be converted to integers
    poolMetrics.poolTokens = [
      makeCoinFromToken(filteredPool.pool_tokens.asset0),
      makeCoinFromToken(filteredPool.pool_tokens.asset1),
    ];

    return {
      poolRaw: {
        "@type": `/${filteredPool.type}`,
        address: filteredPool.address,
        id: filteredPool.pool_id.toString(),
        current_tick_liquidity: filteredPool.current_tick_liquidity,
        token0: filteredPool.pool_tokens.asset0.denom,
        token1: filteredPool.pool_tokens.asset1.denom,
        current_sqrt_price: filteredPool.current_sqrt_price,
        current_tick: filteredPool.current_tick,
        tick_spacing: filteredPool.tick_spacing,
        exponent_at_price_one: filteredPool.exponent_at_price_one,
        spread_factor: filteredPool.spread_factor,
      },
      poolMetrics,
    };
  }

  const sharePoolBase = {
    "@type": `/${filteredPool.type}`,
    id: filteredPool.pool_id.toString(),
    pool_params: {
      exit_fee: new Dec(filteredPool.exit_fees.toString())
        .mul(DecUtils.getTenExponentN(-2))
        .toString(),
      swap_fee: new Dec(filteredPool.swap_fees.toString())
        .mul(DecUtils.getTenExponentN(-2))
        .toString(),
      smooth_weight_change_params: null,
    },
    total_shares: filteredPool.total_shares,
  };

  if (Array.isArray(filteredPool.pool_tokens)) {
    poolMetrics.poolTokens = filteredPool.pool_tokens.map(makeCoinFromToken);
  }

  if (
    filteredPool.type === "osmosis.gamm.v1beta1.Pool" &&
    Array.isArray(filteredPool.pool_tokens)
  ) {
    return {
      poolRaw: {
        ...sharePoolBase,
        pool_assets: filteredPool.pool_tokens.map((token) => ({
          token: {
            denom: token.denom,
            amount: floatNumberToStringInt(token.amount, token.exponent),
          },
          weight: token.weight_or_scaling.toString(),
        })),
        total_weight: filteredPool.total_weight_or_scaling.toString(),
      },
      poolMetrics,
    };
  }

  if (
    filteredPool.type === "osmosis.gamm.poolmodels.stableswap.v1beta1.Pool" &&
    Array.isArray(filteredPool.pool_tokens)
  ) {
    return {
      poolRaw: {
        ...sharePoolBase,
        pool_liquidity: filteredPool.pool_tokens.map((token) => ({
          denom: token.denom,
          amount: floatNumberToStringInt(token.amount, token.exponent),
        })),
        scaling_factors: filteredPool.pool_tokens.map((token) =>
          token.weight_or_scaling.toString()
        ),
        scaling_factor_controller: filteredPool.scaling_factor_controller ?? "",
      },
      poolMetrics,
    };
  }

  throw new Error(
    "Filtered imperator pool not properly serialized as either a balancer or stable pool."
  );
}

function floatNumberToStringInt(number: number, exponent: number): string {
  return new Dec(number.toString())
    .mul(DecUtils.getTenExponentN(exponent))
    .truncate()
    .toString();
}

function makeCoinFromToken(poolToken: PoolToken): CoinPrimitive {
  return {
    denom: poolToken.denom,
    amount: new Dec(poolToken.amount)
      .mul(DecUtils.getTenExponentNInPrecisionRange(poolToken.exponent))
      .truncate()
      .toString(),
  };
}
