import { z } from "zod";

import {
  getPositionHistoricalPerformance,
  mapGetUserPositionDetails,
  mapGetUserPositions,
} from "../queries/complex/concentrated-liquidity";
import { OsmoAddressSchema } from "../queries/complex/parameter-types";
import { queryPositionById } from "../queries/osmosis/concentratedliquidity";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { sort } from "../utils/sort";

export const concentratedLiquidityRouter = createTRPCRouter({
  getUserPositions: publicProcedure
    .input(
      z
        .object({
          sortDirection: z.enum(["asc", "desc"]).default("desc"),
          forPoolId: z.string().optional(),
        })
        .merge(OsmoAddressSchema.required())
    )
    .query(
      ({
        input: { osmoAddress: userOsmoAddress, sortDirection, forPoolId },
        ctx,
      }) =>
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
        .merge(OsmoAddressSchema.required())
    )
    .query(
      async ({ input: { positionId, osmoAddress: userOsmoAddress }, ctx }) => {
        const { position } = await queryPositionById({
          ...ctx,
          id: positionId,
        });

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
        positionId: z.string(),
      })
    )
    .query(({ input: { positionId }, ctx }) =>
      getPositionHistoricalPerformance({ ...ctx, positionId })
    ),
});
