import { Dec, IntPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  calcSumCoinsValue,
  mapRawCoinToPretty,
} from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { UserOsmoAddressSchema } from "~/server/queries/complex/parameter-types";
import {
  getPool,
  getPools,
  PoolFilterSchema,
} from "~/server/queries/complex/pools";
import {
  getCachedPoolIncentivesMap,
  IncentivePoolFilterSchema,
  isIncentivePoolFiltered,
} from "~/server/queries/complex/pools/incentives";
import { getCachedPoolMarketMetricsMap } from "~/server/queries/complex/pools/market";
import { getSuperfluidPoolIds } from "~/server/queries/complex/pools/superfluid";
import { queryBalances } from "~/server/queries/cosmos";
import { WeightedPoolRawResponse } from "~/server/queries/osmosis";
import { queryCLPositions } from "~/server/queries/osmosis/concentratedliquidity";
import { queryAccountLockedCoins } from "~/server/queries/osmosis/lockup/account-locked-coins";
import timeout from "~/utils/async";
import { aggregateRawCoinsByDenom } from "~/utils/coin";
import { createSortSchema, sort } from "~/utils/sort";

import { maybeCachePaginatedItems } from "../pagination";
import { InfiniteQuerySchema } from "../zod-types";

const GetInfinitePoolsSchema = InfiniteQuerySchema.and(PoolFilterSchema).and(
  IncentivePoolFilterSchema
);

const marketIncentivePoolsSortKeys = [
  "totalFiatValueLocked",
  "feesSpent7dUsd",
  "feesSpent24hUsd",
  "volume7dUsd",
  "volume24hUsd",
  "aprBreakdown.total",
] as const;
export type MarketIncentivePoolSortKey =
  (typeof marketIncentivePoolsSortKeys)[number];

/**
 * This router is run on another edge api route since these queries are too expensive
 * and are slowing the other queries down because of JS single threaded nature. Client calls are still
 * the same. The separation is strictly on the server and automatically handled on trpc link.
 *
 * @see /web/utils/trpc.ts
 */
export const poolsRouter = createTRPCRouter({
  getPool: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ input: { poolId } }) => getPool({ poolId })),
  getUserPools: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(async ({ input: { userOsmoAddress } }) => {
      const [
        userBalances,
        lockedCoins,
        accountPositions,
        poolIncentives,
        superfluidPools,
      ] = await Promise.all([
        timeout(
          () => queryBalances({ bech32Address: userOsmoAddress }),
          10_000, // 10 seconds
          "queryBalances"
        )(),
        timeout(
          () =>
            queryAccountLockedCoins({
              bech32Address: userOsmoAddress,
            }),
          10_000, // 10 seconds
          "queryAccountLockedCoins"
        )(),
        timeout(
          () => queryCLPositions({ bech32Address: userOsmoAddress }),
          10_000, // 10 seconds
          "queryCLPositions"
        )(),
        timeout(
          () => getCachedPoolIncentivesMap(),
          10_000, // 10 seconds
          "getCachedPoolIncentivesMap"
        )(),
        timeout(
          () => getSuperfluidPoolIds(),
          10_000, // 10 seconds
          "getSuperfluidPoolIds"
        )(),
      ]);

      const gammAssets = [
        ...userBalances.balances,
        ...lockedCoins.coins,
      ].filter(({ denom }) => denom && denom.startsWith("gamm/pool/"));

      const userPoolIdsSet: Set<string> = new Set(
        accountPositions.positions
          .map(({ position: { pool_id } }) => pool_id)
          .filter((poolId): poolId is string => Boolean(poolId))
      );

      for (const bal of gammAssets) {
        // The pool share token is in the form of 'gamm/pool/${poolId}'.
        if (bal.denom.startsWith("gamm/pool/")) {
          const poolId = bal.denom.replace("gamm/pool/", "");
          userPoolIdsSet.add(poolId);
        }
      }

      const eventualPools = (
        await timeout(
          () => getPools(),
          10_000, // 10 seconds
          "getPools"
        )()
      ).filter((pool) => userPoolIdsSet.has(pool.id));

      const pools = await Promise.all(
        eventualPools.map(async (pool) => {
          const { id, reserveCoins, totalFiatValueLocked, type } = pool;
          let userValue: PricePretty = new PricePretty(
            DEFAULT_VS_CURRENCY,
            new Dec(0)
          );

          if (type === "concentrated") {
            const positions = accountPositions.positions.filter(
              ({ position: { pool_id } }) => pool_id === id
            );

            if (positions.length === 0) {
              throw new Error(
                `Positions for pool id ${id} not found. It should exist if the pool id is available in the userPoolIds set.`
              );
            }

            const aggregatedRawCoins = aggregateRawCoinsByDenom(
              positions.flatMap(({ asset0, asset1 }) => [asset0, asset1])
            );
            const coinsToCalculateValue = await mapRawCoinToPretty(
              aggregatedRawCoins
            );

            userValue = new PricePretty(
              DEFAULT_VS_CURRENCY,
              (await calcSumCoinsValue(coinsToCalculateValue)) ?? new Dec(0)
            );
          } else if (type === "weighted" || type === "stable") {
            const totalShareAmount = new Dec(
              (pool.raw as WeightedPoolRawResponse).total_shares.amount
            );
            const rawShare = aggregateRawCoinsByDenom(
              lockedCoins.coins.filter(
                (coin) => coin.denom === `gamm/pool/${id}`
              )
            )[0];

            if (rawShare) {
              const userValueAmount = totalShareAmount.isZero()
                ? new Dec(0)
                : totalFiatValueLocked
                    .mul(
                      new IntPretty(
                        new Dec(rawShare.amount).quo(totalShareAmount)
                      )
                    )
                    .trim(true);

              userValue = new PricePretty(DEFAULT_VS_CURRENCY, userValueAmount);
            }
          }

          return {
            id,
            type,
            reserveCoins,
            apr: poolIncentives.get(id)?.aprBreakdown?.total,
            poolLiquidity: totalFiatValueLocked,
            isSuperfluid: superfluidPools.some(
              (superfluidPoolId) => superfluidPoolId === id
            ),
            userValue,
            weightedPoolInfo:
              pool.type === "weighted"
                ? {
                    weights: (
                      pool.raw as WeightedPoolRawResponse
                    ).pool_assets.map(({ token: { denom }, weight }) => {
                      const totalWeight = new Dec(
                        (pool.raw as WeightedPoolRawResponse).total_weight
                      );

                      return {
                        denom,
                        weight: new RatePretty(
                          new Dec(weight).quoTruncate(totalWeight)
                        ),
                      };
                    }),
                  }
                : undefined,
          };
        })
      );

      return sort(pools, "userValue");
    }),
  getMarketIncentivePools: publicProcedure
    .input(
      GetInfinitePoolsSchema.and(
        z.object({
          sort: createSortSchema(marketIncentivePoolsSortKeys).default({
            keyPath: "totalFiatValueLocked",
          }),
        })
      )
    )
    .query(
      async ({
        input: {
          search,
          minLiquidityUsd,
          sort: sortInput,
          types,
          incentiveTypes,
          cursor,
          limit,
        },
      }) =>
        maybeCachePaginatedItems({
          getFreshItems: async () => {
            const poolsPromise = getPools({ search, minLiquidityUsd, types });
            const incentivesPromise = getCachedPoolIncentivesMap();
            const marketMetricsPromise = getCachedPoolMarketMetricsMap();

            /** Get remote data via concurrent requests, if needed. */
            const [pools, incentives, marketMetrics] = await Promise.all([
              poolsPromise,
              incentivesPromise,
              marketMetricsPromise,
            ]);

            const marketIncentivePools = pools
              .map((pool) => {
                const incentivesForPool = incentives.get(pool.id);
                const metricsForPool = marketMetrics.get(pool.id);

                const isIncentiveFiltered =
                  incentivesForPool &&
                  isIncentivePoolFiltered(incentivesForPool, {
                    incentiveTypes,
                  });

                if (isIncentiveFiltered) return;

                return {
                  ...pool,
                  ...incentivesForPool,
                  ...metricsForPool,
                };
              })
              .filter((pool): pool is NonNullable<typeof pool> => !!pool);

            // won't sort if searching
            if (search) return marketIncentivePools;
            else
              return sort(
                marketIncentivePools,
                sortInput.keyPath,
                sortInput.direction
              );
          },
          cacheKey: JSON.stringify({
            search,
            sortInput,
            minLiquidityUsd,
            types,
            incentiveTypes,
          }),
          cursor,
          limit,
        })
    ),
});
