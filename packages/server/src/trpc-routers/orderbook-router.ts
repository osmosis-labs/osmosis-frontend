import { Dec } from "@keplr-wallet/unit";
import { z } from "zod";

import { queryOrderbookActiveOrders } from "../queries";
import {
  getOrderbookMakerFee,
  getOrderbookSpotPrice,
} from "../queries/complex/orderbooks";
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
  getSpotPrice: publicProcedure
    .input(
      z
        .object({
          quoteAssetDenom: z.string(),
          baseAssetDenom: z.string(),
        })
        .required()
        .and(OsmoAddressSchema.required())
    )
    .query(async ({ input, ctx }) => {
      const { quoteAssetDenom, baseAssetDenom, osmoAddress } = input;
      const spotPrice = await getOrderbookSpotPrice({
        orderbookAddress: osmoAddress,
        quoteAssetDenom: quoteAssetDenom,
        baseAssetDenom: baseAssetDenom,
        chainList: ctx.chainList,
      });
      return new Dec(spotPrice);
    }),
});
