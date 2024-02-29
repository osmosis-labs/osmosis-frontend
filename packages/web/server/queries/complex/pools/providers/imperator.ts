import {
  CoinPretty,
  Dec,
  DecUtils,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import type { CoinPrimitive } from "@osmosis-labs/keplr-stores";
import {
  ConcentratedLiquidityPoolRaw,
  CosmwasmPoolRaw,
  PoolRaw,
  StablePoolRaw,
  WeightedPoolRaw,
} from "@osmosis-labs/pools";
import { CacheEntry, cachified } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

import {
  FilteredPoolsResponse,
  PoolToken,
  queryFilteredPools,
} from "../../../imperator";
import {
  ConcentratedPoolRawResponse,
  queryNumPools,
  queryPoolmanagerParams,
} from "../../../osmosis";
import { getAsset } from "../../assets";
import { DEFAULT_VS_CURRENCY } from "../../assets/config";
import { Pool } from "..";
import { TransmuterPoolCodeIds } from "../env";

const poolsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Get pools from imperator that are listed in asset list. */
export async function getPoolsFromImperator(): Promise<Pool[]> {
  return cachified({
    cache: poolsCache,
    key: "imperator-pools",
    ttl: 5_000, // 5 seconds
    staleWhileRevalidate: 10_000, // 10 seconds
    getFreshValue: async () => {
      const numPools = await queryNumPools();
      const { pools } = await queryFilteredPools(
        {
          min_liquidity: 0,
          order_by: "desc",
          order_key: "liquidity",
        },
        { offset: 0, limit: Number(numPools.num_pools) }
      );
      return (await Promise.all(pools.map(makePoolFromImperatorPool))).filter(
        (pool): pool is Pool => !!pool
      );
    },
  });
}

/** @deprecated Fetches pools from indexer. */
export async function queryPaginatedPools({
  page,
  limit,
  minimumLiquidity,
  poolId: poolIdParam,
  poolIds: poolIdsParam,
}: {
  page?: number;
  limit?: number;
  minimumLiquidity?: number;
  poolId?: string;
  poolIds?: string[];
}): Promise<{
  status: number;
  pools: PoolRaw[];
  totalNumberOfPools: string;
  pageInfo?: {
    hasNextPage: boolean;
  };
}> {
  // Fetch the pools data from your database or other source
  // This is just a placeholder, replace it with your actual data fetching logic
  const { pools: allPools, totalNumberOfPools } = await fetchAndProcessAllPools(
    {
      minimumLiquidity,
    }
  );

  // Handle the case where specific pool ID is requested
  if (poolIdParam) {
    const pool = allPools.find(
      (pool) => ("pool_id" in pool ? pool.pool_id : pool.id) === poolIdParam
    );
    if (!pool) {
      throw new Error("Pool not found: " + poolIdParam);
    }
    return { status: 200, pools: [pool], totalNumberOfPools };
  }

  // Handle the case where specific pool IDs are requested
  if (poolIdsParam) {
    const pools = allPools.filter((pool) =>
      poolIdsParam.includes("pool_id" in pool ? pool.pool_id : pool.id)
    );
    return { status: 200, pools, totalNumberOfPools };
  }

  // Pagination
  if (page && limit) {
    const startIndex = (page - 1) * limit;

    // Slice the data based on the page and limit
    const pools = allPools.slice(startIndex, startIndex + limit);

    // Return the paginated data
    return {
      status: 200,
      pools,
      totalNumberOfPools,
      pageInfo: {
        hasNextPage: startIndex + limit < allPools.length,
      },
    };
  }

  return { status: 200, pools: allPools, totalNumberOfPools };
}

/** Cache on this current edge function instance. */
const allPoolsLruCache = new LRUCache<string, CacheEntry>({
  max: 2,
});

async function fetchAndProcessAllPools({
  minimumLiquidity = 0,
}): Promise<{ pools: PoolRaw[]; totalNumberOfPools: string }> {
  return cachified({
    key: `all-pools-${minimumLiquidity}`,
    cache: allPoolsLruCache,
    async getFreshValue() {
      const poolManagerParams = await queryPoolmanagerParams();
      const numPools = await queryNumPools();

      // Fetch all pools from imperator, except cosmwasm pools for now
      const filteredPoolsResponse = await queryFilteredPools(
        {
          min_liquidity: minimumLiquidity,
          order_by: "desc",
          order_key: "liquidity",
        },
        { offset: 0, limit: Number(numPools.num_pools) }
      );
      const queryPoolRawResults = filteredPoolsResponse.pools.map((pool) =>
        queryPoolRawFromFilteredPool(
          pool,
          poolManagerParams.params.taker_fee_params.default_taker_fee
        )
      );

      return {
        pools: queryPoolRawResults.filter(
          (
            poolRaw
          ): poolRaw is
            | StablePoolRaw
            | ConcentratedLiquidityPoolRaw
            | WeightedPoolRaw
            | CosmwasmPoolRaw => !!poolRaw
        ),
        totalNumberOfPools:
          filteredPoolsResponse.pagination.total_pools.toString(),
      };
    },
    ttl: 30 * 1000, // 30 seconds
  });
}

/** @deprecated */
export function queryPoolRawFromFilteredPool(
  filteredPool: FilteredPoolsResponse["pools"][number],
  takerFeeRaw: string
):
  | StablePoolRaw
  | ConcentratedLiquidityPoolRaw
  | WeightedPoolRaw
  | CosmwasmPoolRaw
  | undefined {
  // deny pools containing tokens with gamm denoms
  if (
    Array.isArray(filteredPool.pool_tokens) &&
    filteredPool.pool_tokens.some(
      (token) => "denom" in token && token.denom.includes("gamm")
    )
  ) {
    return;
  }

  /** Metrics common to all pools. */
  const poolMetrics: {
    liquidityUsd: number;
    liquidity24hUsdChange: number;

    volume24hUsd: number;
    volume24hUsdChange: number;

    volume7dUsd: number;

    taker_fee: string;
  } = {
    liquidityUsd: filteredPool.liquidity,
    liquidity24hUsdChange: filteredPool.liquidity_24h_change,
    volume24hUsd: filteredPool.volume_24h,
    volume24hUsdChange: filteredPool.volume_24h_change,
    volume7dUsd: filteredPool.volume_7d,
    taker_fee: takerFeeRaw,
  };

  if (
    filteredPool.type === "osmosis.concentratedliquidity.v1beta1.Pool" &&
    !Array.isArray(filteredPool.pool_tokens)
  ) {
    if (!filteredPool.pool_tokens.asset0 || !filteredPool.pool_tokens.asset1)
      return;

    const token0 = filteredPool.pool_tokens.asset0.denom;
    const token1 = filteredPool.pool_tokens.asset1.denom;

    return {
      "@type": `/${filteredPool.type}`,
      address: filteredPool.address,
      id: filteredPool.pool_id.toString(),
      current_tick_liquidity: filteredPool.current_tick_liquidity,
      token0,
      token0Amount: makeCoinFromToken(filteredPool.pool_tokens.asset0).amount,
      token1,
      token1Amount: makeCoinFromToken(filteredPool.pool_tokens.asset1).amount,
      current_sqrt_price: filteredPool.current_sqrt_price,
      current_tick: filteredPool.current_tick,
      tick_spacing: filteredPool.tick_spacing,
      exponent_at_price_one: filteredPool.exponent_at_price_one,
      spread_factor: filteredPool.spread_factor,
      ...poolMetrics,
    };
  }

  if (
    filteredPool.type === "osmosis.cosmwasmpool.v1beta1.CosmWasmPool" &&
    Array.isArray(filteredPool.pool_tokens)
  ) {
    return {
      "@type": "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool",
      contract_address: filteredPool.contract_address,
      pool_id: filteredPool.pool_id.toString(),
      code_id: filteredPool.code_id,
      instantiate_msg: filteredPool.instantiate_msg,
      tokens: filteredPool.pool_tokens.map(makeCoinFromToken),
      ...poolMetrics,
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
    ...poolMetrics,
  };

  if (
    filteredPool.type === "osmosis.gamm.v1beta1.Pool" &&
    Array.isArray(filteredPool.pool_tokens)
  ) {
    return {
      ...sharePoolBase,
      pool_assets: filteredPool.pool_tokens.map((token) => ({
        token: {
          denom: token.denom,
          amount: floatNumberToStringInt(token.amount, token.exponent),
        },
        weight: token.weight_or_scaling.toString(),
      })),
      total_weight: filteredPool.total_weight_or_scaling.toString(),
    };
  }

  if (
    filteredPool.type === "osmosis.gamm.poolmodels.stableswap.v1beta1.Pool" &&
    Array.isArray(filteredPool.pool_tokens)
  ) {
    return {
      ...sharePoolBase,
      pool_liquidity: filteredPool.pool_tokens.map((token) => ({
        denom: token.denom,
        amount: floatNumberToStringInt(token.amount, token.exponent),
      })),
      scaling_factors: filteredPool.pool_tokens.map((token) =>
        token.weight_or_scaling.toString()
      ),
      scaling_factor_controller: filteredPool.scaling_factor_controller ?? "",
    };
  }

  throw new Error("Filtered pool not properly serialized as a valid pool.");
}

/** Converts a number with exponent decimals into a whole integer. */
function floatNumberToStringInt(number: number, exponent: number): string {
  return new Dec(number.toString())
    .mul(DecUtils.getTenExponentN(exponent))
    .truncate()
    .toString();
}

function makeCoinFromToken(poolToken: PoolToken): CoinPrimitive {
  return {
    denom: poolToken.denom,
    amount: floatNumberToStringInt(poolToken.amount, poolToken.exponent),
  };
}

export async function makePoolFromImperatorPool(
  filteredPool: FilteredPoolsResponse["pools"][number]
): Promise<Pool | undefined> {
  // deny pools containing tokens with gamm denoms
  if (
    Array.isArray(filteredPool.pool_tokens) &&
    filteredPool.pool_tokens.some(
      (token) => "denom" in token && token.denom.includes("gamm")
    )
  ) {
    return;
  }

  /** Metrics common to all pools. */
  const basePool: {
    spreadFactor: RatePretty;
    totalFiatValueLocked: PricePretty;
  } = {
    spreadFactor: new RatePretty(
      new Dec(filteredPool.swap_fees.toString()).mul(
        DecUtils.getTenExponentN(-2)
      )
    ),
    totalFiatValueLocked: new PricePretty(
      DEFAULT_VS_CURRENCY,
      filteredPool.liquidity
    ),
  };

  if (
    filteredPool.type === "osmosis.concentratedliquidity.v1beta1.Pool" &&
    !Array.isArray(filteredPool.pool_tokens)
  ) {
    if (!filteredPool.pool_tokens.asset0 || !filteredPool.pool_tokens.asset1)
      return;

    const token0 = filteredPool.pool_tokens.asset0.denom;
    const token1 = filteredPool.pool_tokens.asset1.denom;

    const token0Asset = await getAsset({ anyDenom: token0 }).catch(() => null);
    const token1Asset = await getAsset({ anyDenom: token1 }).catch(() => null);

    if (!token0Asset || !token1Asset) return;

    return {
      id: filteredPool.pool_id.toString(),
      type: "concentrated",
      raw: {
        address: filteredPool.address,
        id: filteredPool.pool_id.toString(),
        current_tick_liquidity: filteredPool.current_tick_liquidity,
        token0,
        token1,
        current_sqrt_price: filteredPool.current_sqrt_price,
        current_tick: filteredPool.current_tick,
        tick_spacing: filteredPool.tick_spacing,
        exponent_at_price_one: filteredPool.exponent_at_price_one,
        spread_factor: filteredPool.spread_factor,
      } as ConcentratedPoolRawResponse,
      reserveCoins: [
        new CoinPretty(token0Asset, filteredPool.pool_tokens.asset0.amount),
        new CoinPretty(token1Asset, filteredPool.pool_tokens.asset0.amount),
      ],
      ...basePool,
      spreadFactor: new RatePretty(filteredPool.spread_factor),
    };
  }

  if (
    filteredPool.type === "osmosis.cosmwasmpool.v1beta1.CosmWasmPool" &&
    Array.isArray(filteredPool.pool_tokens)
  ) {
    const reserveCoins = await getReservesFromPoolTokens(
      filteredPool.pool_tokens
    );

    if (!reserveCoins) return;

    return {
      id: filteredPool.pool_id.toString(),
      type: TransmuterPoolCodeIds.includes(filteredPool.code_id)
        ? "cosmwasm-transmuter"
        : "cosmwasm",
      raw: {
        contract_address: filteredPool.contract_address,
        pool_id: filteredPool.pool_id.toString(),
        code_id: filteredPool.code_id,
        instantiate_msg: filteredPool.instantiate_msg,
      },
      reserveCoins: reserveCoins,
      ...basePool,
    };
  }

  const sharePoolRawBase = {
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

  if (
    filteredPool.type === "osmosis.gamm.v1beta1.Pool" &&
    Array.isArray(filteredPool.pool_tokens)
  ) {
    const reserveCoins = await getReservesFromPoolTokens(
      filteredPool.pool_tokens
    );

    if (!reserveCoins) return;

    return {
      id: filteredPool.pool_id.toString(),
      type: "weighted",
      raw: {
        pool_assets: filteredPool.pool_tokens.map((token) => ({
          token: {
            denom: token.denom,
            amount: floatNumberToStringInt(token.amount, token.exponent),
          },
          weight: token.weight_or_scaling.toString(),
        })),
        total_weight: filteredPool.total_weight_or_scaling.toString(),
        ...sharePoolRawBase,
      },
      reserveCoins,
      ...basePool,
    };
  }

  if (
    filteredPool.type === "osmosis.gamm.poolmodels.stableswap.v1beta1.Pool" &&
    Array.isArray(filteredPool.pool_tokens)
  ) {
    const reserveCoins = await getReservesFromPoolTokens(
      filteredPool.pool_tokens
    );

    if (!reserveCoins) return;

    return {
      id: filteredPool.pool_id.toString(),
      type: "stable",
      raw: {
        pool_liquidity: filteredPool.pool_tokens.map((token) => ({
          denom: token.denom,
          amount: floatNumberToStringInt(token.amount, token.exponent),
        })),
        scaling_factors: filteredPool.pool_tokens.map((token) =>
          token.weight_or_scaling.toString()
        ),
        scaling_factor_controller: filteredPool.scaling_factor_controller ?? "",
        ...sharePoolRawBase,
      },
      reserveCoins,
      ...basePool,
    };
  }

  throw new Error("Filtered pool not properly serialized as a valid pool.");
}

/** Get's reserves from asset list and returns them as CoinPretty objects, or undefined if an asset is not listed. */
async function getReservesFromPoolTokens(poolTokens: PoolToken[]) {
  const coins = await Promise.all(
    poolTokens.map(makeCoinFromToken).map(async (coin) => {
      const asset = await getAsset({ anyDenom: coin.denom }).catch(() => null);
      if (!asset) return;
      return new CoinPretty(asset, coin.amount);
    })
  );
  if (coins.some((asset) => !asset)) return;
  else return coins as CoinPretty[];
}
