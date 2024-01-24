import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { mapRawAssetsToCoinPretty } from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import {
  getTotalClaimableRewards,
  getTotalEarned,
  mapGetUserPositionDetails,
} from "~/server/queries/complex/concentrated-liquidity";
import { UserOsmoAddressSchema } from "~/server/queries/complex/parameter-types";
import { queryPositionPerformance } from "~/server/queries/imperator";
import { queryCLPosition } from "~/server/queries/osmosis/concentratedliquidity";
import { sum } from "~/utils/math";
import { sort } from "~/utils/sort";

export const concentratedLiquidityRouter = createTRPCRouter({
  getUserPositions: publicProcedure
    .input(
      z
        .object({
          sortDirection: z.enum(["asc", "desc"]).default("desc"),
        })
        .merge(UserOsmoAddressSchema.required())
    )
    .query(async ({ input: { userOsmoAddress, sortDirection } }) => {
      const result = await mapGetUserPositionDetails({
        userOsmoAddress,
      });
      return sort(result, "joinTime", sortDirection);
    }),

  getPositionPerformance: publicProcedure
    .input(
      z.object({
        positionId: z.string(),
      })
    )
    .query(async ({ input: { positionId } }) => {
      const [position, performance] = await Promise.all([
        queryCLPosition({ id: positionId }),
        queryPositionPerformance({ positionId }),
      ]);

      const [
        principalAssets,
        currentPositionAssets,
        unclaimedRewards,
        totalEarned,
      ] = await Promise.all([
        mapRawAssetsToCoinPretty({
          rawAssets: performance.principal.assets,
          calculatePrice: true,
        }),
        mapRawAssetsToCoinPretty({
          rawAssets: [position.position.asset0, position.position.asset1],
          calculatePrice: true,
        }),
        getTotalClaimableRewards({
          rawClaimableIncentiveRewards: position.position.claimable_incentives,
          rawClaimableSpreadRewards: position.position.claimable_spread_rewards,
          calculatePrice: true,
        }),
        getTotalEarned({
          totalIncentivesRewards: performance.total_incentives_rewards,
          totalSpreadRewards: performance.total_spread_rewards,
        }),
      ]);

      const totalPrincipalValue = new PricePretty(
        DEFAULT_VS_CURRENCY,
        sum(principalAssets)
      );
      const currentPositionValue = new PricePretty(
        DEFAULT_VS_CURRENCY,
        sum(currentPositionAssets)
      );
      const unclaimedRewardsValue = new PricePretty(
        DEFAULT_VS_CURRENCY,
        sum(unclaimedRewards)
      );
      const totalEarnedValue = new PricePretty(
        DEFAULT_VS_CURRENCY,
        sum(totalEarned)
      );

      const roi = new RatePretty(
        currentPositionValue
          .toDec()
          .add(unclaimedRewardsValue.toDec())
          .add(totalEarnedValue.toDec())
          .sub(totalPrincipalValue.toDec())
          .quo(totalPrincipalValue.toDec())
      );

      return {
        principalAssets,
        totalEarned,
        roi,
      };
    }),
});
