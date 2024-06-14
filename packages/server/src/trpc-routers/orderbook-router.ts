import { Dec } from "@keplr-wallet/unit";

import { queryOrderbookMakerFee } from "../queries";
import { OsmoAddressSchema } from "../queries/complex/parameter-types";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const orderbookRouter = createTRPCRouter({
  getMakerFee: publicProcedure
    .input(OsmoAddressSchema.required())
    .query(async ({ input, ctx }) => {
      const { osmoAddress } = input;
      const { data } = await queryOrderbookMakerFee({
        orderbookAddress: osmoAddress,
        chainList: ctx.chainList,
      });
      return {
        makerFee: new Dec(data),
      };
    }),
});
