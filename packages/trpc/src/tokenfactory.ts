import { queryDenomAuthorityMetadata } from "@osmosis-labs/server";
import z from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const tokenfactoryRouter = createTRPCRouter({
  getDenomAuthorityMetadata: publicProcedure
    .input(z.object({ denom: z.string() }))
    .query(({ input, ctx }) =>
      queryDenomAuthorityMetadata({
        denom: input.denom,
        chainList: ctx.chainList,
      })
    ),
});
