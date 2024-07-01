import { getChain } from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const chainsRouter = createTRPCRouter({
  getChain: publicProcedure
    .input(
      z.object({
        findChainNameOrId: z.string(),
      })
    )
    .query(async ({ input: { findChainNameOrId }, ctx }) =>
      getChain({
        ...ctx,
        chainNameOrId: findChainNameOrId,
      })
    ),
});
