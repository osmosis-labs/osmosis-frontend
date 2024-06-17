import { Dec } from "@keplr-wallet/unit";
import { getOrderbookMakerFee } from "@osmosis-labs/server";
import { queryOrderbookActiveOrders } from "@osmosis-labs/server";
import { z } from "zod";

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
  getActiveOrders: publicProcedure
    .input(
      z
        .object({
          contractOsmoAddress: z.string().startsWith("osmo"),
          userOsmoAddress: z.string().startsWith("osmo"),
        })
        .required()
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
