import { Dec } from "@keplr-wallet/unit";
import { getOrderbookMakerFee } from "@osmosis-labs/server";

import { createTRPCRouter, publicProcedure } from "./api";
import { OsmoAddressSchema } from "./parameter-types";

export const orderbookRouter = createTRPCRouter({
  getMakerFee: publicProcedure
    .input(OsmoAddressSchema.required())
    .query(async ({ input, ctx }) => {
      const { osmoAddress } = input;
      const makerFee = await getOrderbookMakerFee({
        orderbookAddress: osmoAddress,
        chainList: ctx.chainList,
      });
      return {
        makerFee: new Dec(makerFee),
      };
    }),
});
