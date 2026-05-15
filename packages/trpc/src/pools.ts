import {
  createSortSchema,
  CursorPaginationSchema,
  getAsset,
  getCachedPoolIncentivesMap,
  getCachedTransmuterTotalPoolLiquidity,
  getPool,
  getPools,
  getSharePool,
  getSharePoolBondDurations,
  getSuperfluidPoolIds,
  getUserPools,
  getUserSharePools,
  IncentivePoolFilterSchema,
  PoolFilterSchema,
  queryPoolmanagerParams,
} from "@osmosis-labs/server";
import { sort } from "@osmosis-labs/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { UserOsmoAddressSchema } from "./parameter-types";

const GetInfinitePoolsSchema = CursorPaginationSchema.merge(
  PoolFilterSchema
).merge(IncentivePoolFilterSchema);

const marketIncentivePoolsSortKeys = [
  "totalFiatValueLocked",
  "market.feesSpent7dUsd",
  "market.feesSpent24hUsd",
  "market.volume7dUsd",
  "market.volume24hUsd",
  "incentives.aprBreakdown.total.upper",
] as const;
export type MarketIncentivePoolSortKey =
  (typeof marketIncentivePoolsSortKeys)[number];

export const poolsRouter = createTRPCRouter({
  getPool: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ input: { poolId }, ctx }) => getPool({ ...ctx, poolId })),
  getSharePool: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ input: { poolId }, ctx }) => getSharePool({ ...ctx, poolId })),
  getUserPools: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(async ({ input: { userOsmoAddress }, ctx }) =>
      getUserPools({ ...ctx, bech32Address: userOsmoAddress }).then((pools) =>
        sort(pools, "userValue")
      )
    ),
  getUserSharePool: publicProcedure
    .input(
      z.object({ poolId: z.string() }).merge(UserOsmoAddressSchema.required())
    )
    .query(async ({ input: { poolId, userOsmoAddress }, ctx }) =>
      getUserSharePools({
        ...ctx,
        bech32Address: userOsmoAddress,
        poolIds: [poolId],
      }).then((pools) => pools[0] ?? null)
    ),
  getUserSharePools: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(async ({ input: { userOsmoAddress }, ctx }) =>
      getUserSharePools({ ...ctx, bech32Address: userOsmoAddress }).then(
        (pools) => sort(pools, "totalValue")
      )
    ),
  getSharePoolBondDurations: publicProcedure
    .input(
      z
        .object({
          poolId: z.string(),
        })
        .merge(UserOsmoAddressSchema)
    )
    .query(async ({ input: { poolId, userOsmoAddress }, ctx }) =>
      getSharePoolBondDurations({
        ...ctx,
        poolId,
        bech32Address: userOsmoAddress,
      })
    ),
  getPools: publicProcedure
    .input(
      GetInfinitePoolsSchema.merge(
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
          denoms,
          types,
          incentiveTypes,
          cursor,
          limit,
        },
        ctx,
      }) =>
        getPools({
          ...ctx,
          search,
          minLiquidityUsd,
          types,
          incentives: incentiveTypes,
          denoms,
          pagination: {
            cursor,
            limit,
          },
          sort: sortInput,
        })
    ),
  getSuperfluidPoolIds: publicProcedure.query(({ ctx }) =>
    getSuperfluidPoolIds(ctx)
  ),
  getPoolIncentives: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ input: { poolId } }) =>
      getCachedPoolIncentivesMap().then((map) => map.get(poolId) ?? null)
    ),
  getTransmuterTotalPoolLiquidity: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(({ ctx, input: { contractAddress } }) =>
      getCachedTransmuterTotalPoolLiquidity(
        contractAddress,
        ctx.chainList,
        ctx.assetLists
      )
    ),
  /** Returns the on-chain pool creation fee from poolmanager params,
   *  resolved against the asset list so the caller has display symbol +
   *  decimals alongside the raw chain amount. Same fee applies to all
   *  pool types (Balancer, Stableswap, CL). */
  getPoolCreationFee: publicProcedure.query(({ ctx }) =>
    queryPoolmanagerParams({
      chainList: ctx.chainList,
      chainId: ctx.chainList[0].chain_id,
    }).then(({ params }) =>
      params.pool_creation_fee.map((coin) => {
        let symbol: string | undefined;
        let coinDecimals: number | undefined;
        try {
          const asset = getAsset({
            assetLists: ctx.assetLists,
            anyDenom: coin.denom,
          });
          symbol = asset.coinDenom;
          coinDecimals = asset.coinDecimals;
        } catch {
          // Asset not in list; fall through with raw denom/amount so the
          // UI can still render something rather than throwing.
        }
        return {
          coinMinimalDenom: coin.denom,
          amount: coin.amount,
          coinDenom: symbol,
          coinDecimals,
        };
      })
    )
  ),
});
