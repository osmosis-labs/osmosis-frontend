import { queryBalances } from "@osmosis-labs/server";
import z from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const balancesRouter = createTRPCRouter({
  getUserBalances: publicProcedure
    .input(
      z.object({ bech32Address: z.string(), chainId: z.string().optional() })
    )
    .query(({ input, ctx }) =>
      queryBalances({
        ...input,
        ...ctx,
      })
    ),
});
