import { queryOrderbookActiveOrders, queryOrderbookMakerFee } from "../queries";
import {
  ContractOsmoAddressSchema,
  UserOsmoAddressSchema,
} from "../queries/complex/parameter-types";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const orderbookRouter = createTRPCRouter({
  getMakerFee: publicProcedure
    .input(ContractOsmoAddressSchema.required())
    .query(async ({ input, ctx }) => {
      const { contractOsmoAddress } = input;
      const { data } = await queryOrderbookMakerFee({
        orderbookAddress: contractOsmoAddress,
        chainList: ctx.chainList,
      });
      return {
        makerFee: data,
      };
    }),
  getActiveOrders: publicProcedure
    .input(
      ContractOsmoAddressSchema.required().and(UserOsmoAddressSchema.required())
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
