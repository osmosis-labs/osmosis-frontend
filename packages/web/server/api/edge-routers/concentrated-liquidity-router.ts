import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { mapGetUserPositionDetails } from "~/server/queries/complex/concentrated-liquidity";
import { UserOsmoAddressSchema } from "~/server/queries/complex/parameter-types";
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
    .query(({ input: { userOsmoAddress, sortDirection } }) =>
      mapGetUserPositionDetails({
        userOsmoAddress,
      }).then((positions) => sort(positions, "joinTime", sortDirection))
    ),
});
