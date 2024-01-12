import { CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { tickToSqrtPrice } from "@osmosis-labs/math";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { z } from "zod";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getAsset } from "~/server/queries/complex/assets";
import { UserOsmoAddressSchema } from "~/server/queries/complex/parameter-types";
import { queryPositionPerformance } from "~/server/queries/imperator";
import { queryAddressCLPositions } from "~/server/queries/osmosis/concentrated";

export const concentratedLiquidityRouter = createTRPCRouter({
  getUserPositions: publicProcedure
    .input(
      z
        .object({
          sortDirection: z.enum(["asc", "desc"]).default("desc").optional(),
        })
        .merge(UserOsmoAddressSchema.required())
    )
    .query(async ({ input: { userOsmoAddress, sortDirection } }) => {
      const { positions: rawPositions } = await queryAddressCLPositions({
        bech32Address: userOsmoAddress,
      });

      // TODO: sort by joinDate
      const positionsWithPerformance = await getPositionsWithPerformance({
        userOsmoAddress,
        positions: rawPositions,
      });
      const result = await normalizePositions({
        positions: positionsWithPerformance,
      });
      return result;
    }),
});

type LiquidityPosition = Awaited<
  ReturnType<typeof queryAddressCLPositions>
>["positions"][number];
type PositionPerformance = Awaited<ReturnType<typeof queryPositionPerformance>>;

type PositionStatus =
  | "inRange"
  | "nearBounds"
  | "outOfRange"
  | "fullRange"
  | "unbonding"
  | "superfluidStaked"
  | "superfluidUnstaking";

function getPositionStatus({
  lowerPrice,
  upperPrice,
  currentPrice,
  isFullRange,
  isSuperfluid,
  isSuperfluidUnstaking,
  isUnbonding,
}: {
  lowerPrice: Dec;
  upperPrice: Dec;
  currentPrice: Dec;
  isFullRange: boolean;
  isSuperfluid: boolean;
  isSuperfluidUnstaking: boolean;
  isUnbonding: boolean;
}): PositionStatus {
  const inRange = lowerPrice.lt(currentPrice) && upperPrice.gt(currentPrice);
  const diff = new Dec(
    Math.min(
      Number(currentPrice.sub(lowerPrice).toString()),
      Number(upperPrice.sub(currentPrice).toString())
    )
  );
  const rangeDiff = upperPrice.sub(lowerPrice);
  const diffPercentage =
    currentPrice.isZero() || rangeDiff.isZero()
      ? new Dec(0)
      : diff.quo(rangeDiff).mul(new Dec(100));

  let status: PositionStatus;

  if (isFullRange) {
    status = "fullRange";
  } else if (isUnbonding) {
    status = "unbonding";
  } else if (isSuperfluid) {
    status = "superfluidStaked";
  } else if (isSuperfluidUnstaking) {
    status = "superfluidUnstaking";
  } else if (inRange) {
    status = diffPercentage.lte(new Dec(15)) ? "nearBounds" : "inRange";
  } else {
    status = "outOfRange";
  }

  return status;
}

async function getPositionAsset({
  amount,
  denom,
}: LiquidityPosition["asset0"] & LiquidityPosition["asset1"]) {
  const asset = await getAsset({
    anyDenom: denom,
  });

  if (!amount || !denom) return undefined;
  if (!asset) throw new Error("Asset not found " + denom);

  return new CoinPretty(asset, amount);
}

function getClTickPrice({
  tick,
  baseAsset,
  quoteAsset,
}: {
  tick: Int;
  baseAsset: CoinPretty;
  quoteAsset: CoinPretty;
}) {
  const sqrtPrice = tickToSqrtPrice(tick);
  const multiplicationQuoteOverBase = DecUtils.getTenExponentN(
    baseAsset.currency.coinDecimals - quoteAsset.currency.coinDecimals
  );
  const price = sqrtPrice.mul(sqrtPrice).mul(multiplicationQuoteOverBase);
  return price;
}

async function mapRawAssetsToCoinPretty({
  rawAssets,
}: {
  rawAssets?: {
    amount: string | number;
    denom: string;
  }[];
}) {
  if (!rawAssets) return [];
  const result = await Promise.all(
    rawAssets.map(async ({ amount, denom }) => {
      const asset = await getAsset({
        anyDenom: denom,
      });

      if (!asset) return undefined;
      const coin = new CoinPretty(asset, amount);
      return coin;
    })
  );
  return result.filter((p): p is NonNullable<typeof p> => !!p);
}

async function getTotalClaimableRewards({
  rawClaimableIncentiveRewards,
  rawClaimableSpreadRewards,
}: {
  rawClaimableSpreadRewards: LiquidityPosition["claimable_spread_rewards"];
  rawClaimableIncentiveRewards: LiquidityPosition["claimable_incentives"];
}) {
  const [claimableIncentiveRewards, claimableSpreadRewards] = await Promise.all(
    [
      mapRawAssetsToCoinPretty({
        rawAssets: rawClaimableIncentiveRewards,
      }),
      mapRawAssetsToCoinPretty({
        rawAssets: rawClaimableSpreadRewards,
      }),
    ]
  );

  return Array.from(
    [...claimableSpreadRewards, ...claimableIncentiveRewards]
      .reduce<Map<string, CoinPretty>>((sumByDenoms, coin) => {
        const current = sumByDenoms.get(coin.currency.coinMinimalDenom);
        if (current) {
          sumByDenoms.set(coin.currency.coinMinimalDenom, current.add(coin));
        } else {
          sumByDenoms.set(coin.currency.coinMinimalDenom, coin);
        }
        return sumByDenoms;
      }, new Map())
      .values()
  );
}

const positionsWithPerformanceCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

async function getPositionsWithPerformance({
  userOsmoAddress,
  positions,
}: {
  userOsmoAddress: string;
  positions: LiquidityPosition[];
}): Promise<(LiquidityPosition & { performance: PositionPerformance })[]> {
  return cachified({
    cache: positionsWithPerformanceCache,
    key: `${userOsmoAddress}-positions-with-performance`,
    getFreshValue: async () => {
      const positionsWithPerformance = await Promise.all(
        positions.map(async (position) => {
          const performance = await queryPositionPerformance({
            positionId: position.position.position_id,
          });

          return {
            ...position,
            performance,
          };
        })
      );

      return positionsWithPerformance;
    },
    ttl: 10 * 1000, // 10 seconds
  });
}

async function normalizePositions({
  positions,
}: {
  positions: Awaited<ReturnType<typeof getPositionsWithPerformance>>;
}) {
  try {
    const normalizedPositions = await Promise.all(
      positions.map(
        async ({
          asset0,
          asset1,
          position,
          performance,
          claimable_incentives,
          claimable_spread_rewards,
        }) => {
          const [baseAsset, quoteAsset] = await Promise.all([
            getPositionAsset(asset0),
            getPositionAsset(asset1),
          ]);

          if (!baseAsset || !quoteAsset) return undefined;

          const lowerTick = new Int(position.lower_tick);
          const upperTick = new Int(position.upper_tick);
          const priceRangePromise = Promise.all([
            getClTickPrice({
              tick: lowerTick,
              baseAsset,
              quoteAsset,
            }),
            getClTickPrice({
              tick: upperTick,
              baseAsset,
              quoteAsset,
            }),
          ]);
          const principalAssetsPromise = mapRawAssetsToCoinPretty({
            rawAssets: performance.principal.assets,
          });
          const unclaimedRewardsPromise = getTotalClaimableRewards({
            rawClaimableIncentiveRewards: claimable_incentives,
            rawClaimableSpreadRewards: claimable_spread_rewards,
          });

          const [priceRange, principalAssets, unclaimedRewards] =
            await Promise.all([
              priceRangePromise,
              principalAssetsPromise,
              unclaimedRewardsPromise,
            ]);

          const liquidity = new Dec(position.liquidity);
          const currentAssets = [baseAsset, quoteAsset];

          return {
            id: position.position_id,
            poolId: position.pool_id,
            priceRange,
            liquidity,
            currentAssets,
            principalAssets,
            unclaimedRewards,
          };
        }
      )
    );

    return normalizedPositions.filter((p): p is NonNullable<typeof p> => !!p);
  } catch (e) {
    console.error(e);
    throw e;
  }
}
