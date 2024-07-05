import { getChain } from "@osmosis-labs/server";
import { EthereumChainInfo } from "@osmosis-labs/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const chainsRouter = createTRPCRouter({
  /** Get Cosmos chain. */
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
  getEvmChain: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
      })
    )
    .query(async ({ input: { chainId } }) =>
      Object.values(EthereumChainInfo).find((chain) => chain.id === chainId)
    ),
});
