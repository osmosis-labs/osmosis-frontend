import { apiClient } from "@osmosis-labs/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const swappedRouter = createTRPCRouter({
  getSignature: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
      })
    )
    .query(async ({ input: { walletAddress } }) => {
      return (await apiClient("/api/swapped-signature", {
        method: "POST",
        body: JSON.stringify({ walletAddress }),
      })) as { url: string };
    }),
});
