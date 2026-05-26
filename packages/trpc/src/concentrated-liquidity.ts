import {
  getAssets,
  getLiquidityPerTickRange,
  getPositionHistoricalPerformance,
  mapGetUserPositionDetails,
  mapGetUserPositions,
  PositionStatus,
  queryClParams,
  queryPositionById,
} from "@osmosis-labs/server";
import { AppCurrency } from "@osmosis-labs/types";
import { PricePretty } from "@osmosis-labs/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { UserOsmoAddressSchema } from "./parameter-types";

// Status grouping order for the user-positions sort: surface positions that
// need attention (out of range) first, then those approaching the boundary,
// then everything else. Unbonding/superfluid statuses aren't ranked because
// CL positions never enter those states in this surface.
const POSITION_STATUS_ORDER: Partial<Record<PositionStatus, number>> = {
  outOfRange: 0,
  nearBounds: 1,
  inRange: 2,
  fullRange: 3,
};
const UNKNOWN_STATUS_ORDER = 99;

/**
 * Compares two user positions for sort order, surfacing those needing
 * attention first (out of range), then larger USD value within each status
 * group, with a final tiebreaker on position id for deterministic ordering.
 */
export function compareUserPositionsByStatusThenValue(
  a: { status?: PositionStatus; currentValue: PricePretty; id: string },
  b: { status?: PositionStatus; currentValue: PricePretty; id: string }
): number {
  const aOrder =
    (a.status && POSITION_STATUS_ORDER[a.status]) ?? UNKNOWN_STATUS_ORDER;
  const bOrder =
    (b.status && POSITION_STATUS_ORDER[b.status]) ?? UNKNOWN_STATUS_ORDER;
  if (aOrder !== bOrder) return aOrder - bOrder;

  const sizeDiff = b.currentValue.toDec().sub(a.currentValue.toDec());
  if (sizeDiff.isPositive()) return 1;
  if (sizeDiff.isNegative()) return -1;

  // Final tiebreaker keeps order stable across refetches when status and
  // value are identical (e.g. two zero-value positions).
  return a.id.localeCompare(b.id);
}

const LiquidityPositionSchema = z.object({
  position: z.object({
    position_id: z.string(),
    address: z.string(),
    join_time: z.string(),
    liquidity: z.string(),
    lower_tick: z.string(),
    pool_id: z.string(),
    upper_tick: z.string(),
  }),
  asset0: z.object({
    amount: z.string(),
    denom: z.string(),
  }),
  asset1: z.object({
    amount: z.string(),
    denom: z.string(),
  }),
  claimable_spread_rewards: z.array(
    z.object({
      denom: z.string(),
      amount: z.string(),
    })
  ),
  claimable_incentives: z.array(
    z.object({
      denom: z.string(),
      amount: z.string(),
    })
  ),
  forfeited_incentives: z.array(
    z.object({
      denom: z.string(),
      amount: z.string(),
    })
  ),
});

export const concentratedLiquidityRouter = createTRPCRouter({
  getUserPositions: publicProcedure
    .input(
      z
        .object({
          forPoolId: z.string().optional(),
        })
        .merge(UserOsmoAddressSchema.required())
    )
    .query(({ input: { userOsmoAddress, forPoolId }, ctx }) =>
      mapGetUserPositions({
        ...ctx,
        userOsmoAddress,
        forPoolId,
      }).then((positions) =>
        [...positions].sort(compareUserPositionsByStatusThenValue)
      )
    ),
  getPositionDetails: publicProcedure
    .input(
      z
        .object({
          position: z.union([z.string(), LiquidityPositionSchema]),
        })
        .merge(UserOsmoAddressSchema.required())
    )
    .query(
      async ({ input: { position: givenPosition, userOsmoAddress }, ctx }) => {
        const { position } =
          typeof givenPosition === "string"
            ? await queryPositionById({ ...ctx, id: givenPosition })
            : { position: givenPosition };

        return (
          await mapGetUserPositionDetails({
            ...ctx,
            positions: [position],
            userOsmoAddress,
          })
        )[0];
      }
    ),
  getPositionHistoricalPerformance: publicProcedure
    .input(
      z.object({
        position: z.union([z.string(), LiquidityPositionSchema]),
      })
    )
    .query(({ input: { position }, ctx }) =>
      getPositionHistoricalPerformance({ ...ctx, position })
    ),
  getLiquidityPerTickRange: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ ctx, input }) => getLiquidityPerTickRange({ ...ctx, ...input })),
  getTokens: publicProcedure
    .input(
      z.object({
        onlyVerified: z.boolean().default(false),
        includePreview: z.boolean().default(false),
      })
    )
    .query(({ ctx, input }) =>
      getAssets({
        assetLists: ctx.assetLists,
        onlyVerified: input.onlyVerified,
        includePreview: input.includePreview,
      })
        .map((asset) => {
          const assetListAsset = getAssetFromAssetList({
            assetLists: ctx.assetLists,
            coinMinimalDenom: asset.coinMinimalDenom,
          });

          if (!assetListAsset) return;

          return {
            chainName: assetListAsset.rawAsset.chainName,
            token: {
              coinDenom: asset.coinDenom,
              coinDecimals: asset.coinDecimals,
              coinMinimalDenom: asset.coinMinimalDenom,
              coinImageUrl: asset.coinImageUrl,
            } satisfies AppCurrency,
          };
        })
        .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset))
    ),
  getClParams: publicProcedure.query(({ ctx }) =>
    queryClParams({ ...ctx, chainId: ctx.chainList[0].chain_id }).then(
      (clParams) => ({
        authorizedTickSpacing: clParams.params.authorized_tick_spacing,
        authorizedSpreadFactors: clParams.params.authorized_spread_factors,
        balancerSharesRewardDiscount:
          clParams.params.balancer_shares_reward_discount,
        authorizedQuoteDenoms: clParams.params.authorized_quote_denoms,
        authorizedUptimes: clParams.params.authorized_uptimes,
        isPermissionlessPoolCreationEnabled:
          clParams.params.is_permissionless_pool_creation_enabled,
        unrestrictedPoolCreatorWhitelist:
          clParams.params.unrestricted_pool_creator_whitelist,
        hookGasLimit: clParams.params.hook_gas_limit,
      })
    )
  ),
});
