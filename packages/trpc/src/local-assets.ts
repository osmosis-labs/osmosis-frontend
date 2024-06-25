import { getAsset, getAssetWithUserBalance } from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { UserOsmoAddressSchema } from "./parameter-types";

const evmSchema = z.object({
  type: z.literal("evm"),
  address: z.string().startsWith("0x"),
  userAddress: z.string(),
  chainId: z.number(),
});

const cosmosSchema = z
  .object({
    type: z.literal("cosmos"),
    anyDenom: z.string(),
  })
  .merge(UserOsmoAddressSchema.required());

export const localAssetsRouter = createTRPCRouter({
  getBalance: publicProcedure
    .input(z.union([evmSchema, cosmosSchema]))
    .query(async ({ input, ctx }) => {
      if (input.type === "evm") {
      }

      if (input.type === "cosmos") {
        const asset = getAsset({
          ...ctx,
          anyDenom: input.anyDenom,
        });

        return await getAssetWithUserBalance({
          ...ctx,
          asset,
          userOsmoAddress: input.userOsmoAddress,
        });
      }
    }),
});
