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
});
