import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  getPositionHistoricalPerformance,
  mapGetUserPositionDetails,
  mapGetUserPositions,
} from "~/server/queries/complex/concentrated-liquidity";
import { UserOsmoAddressSchema } from "~/server/queries/complex/parameter-types";
import { queryPositionById } from "~/server/queries/osmosis/concentratedliquidity";
import { sort } from "~/utils/sort";

export const concentratedLiquidityRouter = createTRPCRouter({
  getUserPositions: publicProcedure
    .input(
      z
        .object({
          sortDirection: z.enum(["asc", "desc"]).default("desc"),
          forPoolId: z.string().optional(),
        })
        .merge(UserOsmoAddressSchema.required())
    )
    .query(({ input: { userOsmoAddress, sortDirection, forPoolId } }) =>
      mapGetUserPositions({
        userOsmoAddress,
        forPoolId,
      }).then((positions) => sort(positions, "joinTime", sortDirection))
    ),
  getPositionDetails: publicProcedure
    .input(
      z
        .object({
          positionId: z.string(),
        })
        .merge(UserOsmoAddressSchema.required())
    )
    .query(async ({ input: { positionId, userOsmoAddress } }) => {
      const { position } = await queryPositionById({ id: positionId });

      return (
        await mapGetUserPositionDetails({
          positions: [position],
          userOsmoAddress,
        })
      )[0];
    }),
  getPositionHistoricalPerformance: publicProcedure
    .input(
      z.object({
        positionId: z.string(),
      })
    )
    .query(({ input: { positionId } }) =>
      getPositionHistoricalPerformance({ positionId })
    ),
});
