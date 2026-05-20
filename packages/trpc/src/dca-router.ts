import { getDcaVaultsByOwner } from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { UserOsmoAddressSchema } from "./parameter-types";

const GetVaultsByOwnerInputSchema = UserOsmoAddressSchema.required().merge(
  z.object({
    contractAddress: z.string(),
  })
);

export const dcaRouter = createTRPCRouter({
  getVaultsByOwner: publicProcedure
    .input(GetVaultsByOwnerInputSchema)
    .query(async ({ input, ctx }) => {
      const { userOsmoAddress, contractAddress } = input;
      if (!contractAddress || !userOsmoAddress) return { vaults: [] };
      const vaults = await getDcaVaultsByOwner({
        contractAddress,
        userOsmoAddress,
        chainList: ctx.chainList,
      });
      return { vaults };
    }),
});
