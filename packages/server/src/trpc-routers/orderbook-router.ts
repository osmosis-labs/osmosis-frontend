import { Dec } from "@keplr-wallet/unit";

import { queryOrderbookActiveOrders } from "../queries";
import { getOrderbookMakerFee } from "../queries/complex/orderbooks";
import { OsmoAddressSchema } from "../queries/complex/parameter-types";
import { createTRPCRouter, publicProcedure } from "../trpc";

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
  getActiveOrders: publicProcedure
    .input(
      OsmoAddressSchema.required()
        .transform(({ osmoAddress }) => ({
          contractOsmoAddress: osmoAddress,
        }))
        .and(
          OsmoAddressSchema.required().transform(({ osmoAddress }) => ({
            userOsmoAddress: osmoAddress,
          }))
        )
    )
    .query(async ({ input, ctx }) => {
      const { contractOsmoAddress, userOsmoAddress } = input;
      const resp = await queryOrderbookActiveOrders({
        orderbookAddress: contractOsmoAddress,
        userAddress: userOsmoAddress,
        chainList: ctx.chainList,
      });
      return resp.data;
    }),
});
