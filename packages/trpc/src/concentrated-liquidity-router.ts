import {
  getPositionHistoricalPerformance,
  mapGetUserPositionDetails,
  mapGetUserPositions,
  queryPositionById,
} from "@osmosis-labs/server";
import { sort } from "@osmosis-labs/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { UserOsmoAddressSchema } from "./parameter-types";

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
    .query(({ input: { userOsmoAddress, sortDirection, forPoolId }, ctx }) =>
      mapGetUserPositions({
        ...ctx,
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
    .query(async ({ input: { positionId, userOsmoAddress }, ctx }) => {
      const { position } = await queryPositionById({ ...ctx, id: positionId });

      return (
        await mapGetUserPositionDetails({
          ...ctx,
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
    .query(({ input: { positionId }, ctx }) =>
      getPositionHistoricalPerformance({ ...ctx, positionId })
    ),
});
