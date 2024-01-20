import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { mapRawAssetsToCoinPretty } from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import {
  getTotalClaimableRewards,
  getTotalEarned,
  normalizePositions,
} from "~/server/queries/complex/concentrated-liquidity";
import { UserOsmoAddressSchema } from "~/server/queries/complex/parameter-types";
import { queryPositionPerformance } from "~/server/queries/imperator";
import {
  queryCLPosition,
  queryCLPositions,
} from "~/server/queries/osmosis/concentratedliquidity";
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
      const { positions: rawPositions } = await queryCLPositions({
        bech32Address: userOsmoAddress,
      });

      const result = await normalizePositions({
        positions: rawPositions,
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

      const totalPrincipalValue = principalAssets.reduce(
        (sum, asset) => sum.add(asset.fiatValue ?? new Dec(0)),
        new PricePretty(DEFAULT_VS_CURRENCY, 0)
      );
      const currentPositionValue = currentPositionAssets.reduce(
        (sum, asset) => sum.add(asset.fiatValue ?? new Dec(0)),
        new PricePretty(DEFAULT_VS_CURRENCY, 0)
      );
      const unclaimedRewardsValue = unclaimedRewards.reduce(
        (sum, asset) => sum.add(asset.fiatValue ?? new Dec(0)),
        new PricePretty(DEFAULT_VS_CURRENCY, 0)
      );
      const totalEarnedValue = totalEarned.reduce(
        (sum, asset) => sum.add(asset.fiatValue ?? new Dec(0)),
        new PricePretty(DEFAULT_VS_CURRENCY, 0)
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
